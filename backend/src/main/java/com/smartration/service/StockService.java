package com.smartration.service;

import com.smartration.dto.StockAdjustmentRequest;
import com.smartration.dto.StockBatchRequest;
import com.smartration.dto.StockSummaryDto;
import com.smartration.entity.Commodity;
import com.smartration.entity.RationShop;
import com.smartration.entity.StockBatch;
import com.smartration.entity.StockMovement;
import com.smartration.entity.User;
import com.smartration.entity.enums.NotificationType;
import com.smartration.entity.enums.Role;
import com.smartration.entity.enums.StockMovementType;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.InsufficientStockException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.CommodityRepository;
import com.smartration.repository.DistributionItemRepository;
import com.smartration.repository.RationShopRepository;
import com.smartration.repository.StockBatchRepository;
import com.smartration.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final StockBatchRepository stockBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CommodityRepository commodityRepository;
    private final RationShopRepository shopRepository;
    private final DistributionItemRepository distributionItemRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final SseService sseService;
    private final AuthService authService;

    @Transactional
    public StockBatch recordIncomingStock(StockBatchRequest req, String ipAddress) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long shopId = req.getShopId();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        if (shopId == null) {
            throw new BadRequestException("Shop ID is required");
        }

        final Long finalShopId = shopId;
        RationShop shop = shopRepository.findById(finalShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found with ID: " + finalShopId));

        Commodity commodity = commodityRepository.findById(req.getCommodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity not found with ID: " + req.getCommodityId()));

        StockBatch batch = StockBatch.builder()
                .shop(shop)
                .commodity(commodity)
                .batchNumber(req.getBatchNumber().toUpperCase().trim())
                .warehouseRef(req.getWarehouseRef().trim())
                .receivedDate(req.getReceivedDate() != null ? req.getReceivedDate() : LocalDate.now())
                .initialQuantity(req.getQuantity())
                .availableQuantity(req.getQuantity())
                .createdByUser(currentUser)
                .createdAt(LocalDateTime.now())
                .build();

        StockBatch savedBatch = stockBatchRepository.save(batch);

        BigDecimal currentTotal = stockBatchRepository.getTotalAvailableStock(finalShopId, commodity.getId());

        StockMovement movement = StockMovement.builder()
                .shop(shop)
                .commodity(commodity)
                .movementType(StockMovementType.INWARD_RECEIPT)
                .quantity(req.getQuantity())
                .balanceAfter(currentTotal)
                .batch(savedBatch)
                .referenceId(req.getWarehouseRef())
                .reason("Inward warehouse receipt - Batch: " + savedBatch.getBatchNumber())
                .performedByUser(currentUser)
                .createdAt(LocalDateTime.now())
                .build();

        stockMovementRepository.save(movement);

        auditLogService.logAction(currentUser, "STOCK_INWARD_RECEIPT", "STOCK_BATCH",
                savedBatch.getId().toString(), finalShopId,
                "Received " + req.getQuantity() + " " + commodity.getMeasurementUnit() + " of " + commodity.getName(), ipAddress);

        // Notify dashboard & live stream
        sseService.broadcastEvent("STOCK_UPDATE", getShopStockSummary(finalShopId));

        return savedBatch;
    }

    @Transactional
    public StockMovement recordStockAdjustment(StockAdjustmentRequest req, String ipAddress) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long shopId = req.getShopId();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        if (shopId == null) {
            throw new BadRequestException("Shop ID is required");
        }

        final Long finalShopId = shopId;
        RationShop shop = shopRepository.findById(finalShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found with ID: " + finalShopId));

        Commodity commodity = commodityRepository.findById(req.getCommodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity not found with ID: " + req.getCommodityId()));

        BigDecimal totalStock = stockBatchRepository.getTotalAvailableStock(finalShopId, commodity.getId());
        if (totalStock.compareTo(req.getQuantity()) < 0) {
            throw new InsufficientStockException("Cannot adjust " + req.getQuantity() + " " + commodity.getMeasurementUnit() +
                    ". Available stock is only " + totalStock);
        }

        // Deduct from batches using FIFO or specific batch
        BigDecimal remainingToAdjust = req.getQuantity();
        StockBatch targetBatch = null;

        if (req.getBatchId() != null) {
            targetBatch = stockBatchRepository.findById(req.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock batch not found: " + req.getBatchId()));
            if (targetBatch.getAvailableQuantity().compareTo(remainingToAdjust) < 0) {
                throw new InsufficientStockException("Selected batch only has " + targetBatch.getAvailableQuantity() + " available");
            }
            targetBatch.setAvailableQuantity(targetBatch.getAvailableQuantity().subtract(remainingToAdjust));
            stockBatchRepository.save(targetBatch);
        } else {
            List<StockBatch> batches = stockBatchRepository
                    .findByShopIdAndCommodityIdAndAvailableQuantityGreaterThanOrderByReceivedDateAsc(shopId, commodity.getId(), BigDecimal.ZERO);

            for (StockBatch b : batches) {
                if (remainingToAdjust.compareTo(BigDecimal.ZERO) <= 0) break;

                BigDecimal canDeduct = b.getAvailableQuantity().min(remainingToAdjust);
                b.setAvailableQuantity(b.getAvailableQuantity().subtract(canDeduct));
                remainingToAdjust = remainingToAdjust.subtract(canDeduct);
                stockBatchRepository.save(b);
                targetBatch = b;
            }
        }

        BigDecimal newBalance = stockBatchRepository.getTotalAvailableStock(shopId, commodity.getId());

        StockMovement movement = StockMovement.builder()
                .shop(shop)
                .commodity(commodity)
                .movementType(req.getMovementType())
                .quantity(req.getQuantity().negate())
                .balanceAfter(newBalance)
                .batch(targetBatch)
                .referenceId("ADJ-" + System.currentTimeMillis())
                .reason(req.getReason())
                .performedByUser(currentUser)
                .createdAt(LocalDateTime.now())
                .build();

        StockMovement savedMovement = stockMovementRepository.save(movement);

        auditLogService.logAction(currentUser, "STOCK_ADJUSTMENT", "STOCK_MOVEMENT",
                savedMovement.getId().toString(), shopId,
                "Adjusted -" + req.getQuantity() + " " + commodity.getMeasurementUnit() + " due to: " + req.getReason(), ipAddress);

        // Check if low stock threshold breached
        checkAndTriggerLowStockAlert(shop, commodity, newBalance);

        sseService.broadcastEvent("STOCK_UPDATE", getShopStockSummary(shopId));

        return savedMovement;
    }

    public void checkAndTriggerLowStockAlert(RationShop shop, Commodity commodity, BigDecimal currentStock) {
        if (currentStock.compareTo(commodity.getLowStockThreshold()) <= 0) {
            String title = "Low Stock Alert: " + commodity.getName();
            String message = "Current stock for " + commodity.getName() + " at " + shop.getShopName() +
                    " has dropped to " + currentStock + " " + commodity.getMeasurementUnit() +
                    " (Threshold: " + commodity.getLowStockThreshold() + "). Please request warehouse replenishment.";

            notificationService.createNotification(null, "SHOP_OPERATOR", shop.getId(), title, message, NotificationType.LOW_STOCK);
            notificationService.createNotification(null, "SUPER_ADMIN", null, title, message, NotificationType.LOW_STOCK);
        }
    }

    @Transactional(readOnly = true)
    public List<StockSummaryDto> getShopStockSummary(Long shopId) {
        List<Commodity> commodities = commodityRepository.findByIsActiveTrue();
        List<StockSummaryDto> list = new ArrayList<>();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now();

        // 7-day window for daily burn rate estimation
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay();

        for (Commodity c : commodities) {
            BigDecimal currentStock = stockBatchRepository.getTotalAvailableStock(shopId, c.getId());
            BigDecimal todayDistributed = distributionItemRepository.sumQuantityByCommodityAndPeriod(shopId, c.getId(), startOfDay, endOfDay);
            BigDecimal past7DaysDistributed = distributionItemRepository.sumQuantityByCommodityAndPeriod(shopId, c.getId(), sevenDaysAgo, endOfDay);

            Double daysUntilStockout = null;
            if (past7DaysDistributed != null && past7DaysDistributed.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal dailyRate = past7DaysDistributed.divide(BigDecimal.valueOf(7), 2, RoundingMode.HALF_UP);
                if (dailyRate.compareTo(BigDecimal.ZERO) > 0) {
                    daysUntilStockout = currentStock.divide(dailyRate, 1, RoundingMode.HALF_UP).doubleValue();
                }
            }

            boolean isLow = currentStock.compareTo(c.getLowStockThreshold()) <= 0;

            list.add(StockSummaryDto.builder()
                    .commodityId(c.getId())
                    .commodityCode(c.getCode())
                    .commodityName(c.getName())
                    .measurementUnit(c.getMeasurementUnit())
                    .currentStock(currentStock)
                    .lowStockThreshold(c.getLowStockThreshold())
                    .isLowStock(isLow)
                    .todayDistributed(todayDistributed != null ? todayDistributed : BigDecimal.ZERO)
                    .daysUntilStockout(daysUntilStockout)
                    .build());
        }

        return list;
    }

    @Transactional(readOnly = true)
    public Page<StockMovement> getMovements(Long shopId, Pageable pageable) {
        return stockMovementRepository.findByShopIdOrderByCreatedAtDesc(shopId, pageable);
    }

    @Transactional(readOnly = true)
    public List<StockBatch> getBatches(Long shopId) {
        return stockBatchRepository.findByShopIdOrderByReceivedDateDesc(shopId);
    }
}
