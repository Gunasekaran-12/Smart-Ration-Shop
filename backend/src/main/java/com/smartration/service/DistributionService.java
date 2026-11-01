package com.smartration.service;

import com.smartration.dto.DistributionItemRequest;
import com.smartration.dto.DistributionRequest;
import com.smartration.dto.DistributionResponse;
import com.smartration.dto.ReceiptDto;
import com.smartration.entity.*;
import com.smartration.entity.enums.NotificationType;
import com.smartration.entity.enums.Role;
import com.smartration.entity.enums.StockMovementType;
import com.smartration.exception.*;
import com.smartration.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistributionService {

    private final DistributionRepository distributionRepository;
    private final DistributionItemRepository distributionItemRepository;
    private final RationCardRepository rationCardRepository;
    private final RationShopRepository shopRepository;
    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final MonthlyEntitlementRepository monthlyEntitlementRepository;
    private final EntitlementService entitlementService;
    private final StockService stockService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SseService sseService;
    private final AuthService authService;
    private final RationBookingRepository rationBookingRepository;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized DistributionResponse processDistribution(DistributionRequest req, String ipAddress) {
        // 1. Idempotency Check
        if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().isBlank()) {
            var existing = distributionRepository.findByIdempotencyKey(req.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Idempotent request detected for key {}. Returning existing distribution.", req.getIdempotencyKey());
                return mapToResponse(existing.get());
            }
        }

        // 2. Authenticated Operator & Shop Verification
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long shopId = req.getShopId();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        if (shopId == null) {
            throw new BadRequestException("Shop ID is required for distribution");
        }

        final Long targetShopId = shopId;
        RationShop shop = shopRepository.findById(targetShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found with ID: " + targetShopId));

        // 3. Ration Card Status & Shop Assignment Verification
        RationCard card = rationCardRepository.findById(req.getRationCardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ration card not found with ID: " + req.getRationCardId()));

        if (!Boolean.TRUE.equals(card.getIsActive())) {
            throw new BadRequestException("Cannot distribute commodities against an INACTIVE ration card (" + card.getCardNumber() + ")");
        }

        if (!card.getShop().getId().equals(shop.getId())) {
            throw new BadRequestException("Ration card " + card.getCardNumber() + " is registered at Shop " +
                    card.getShop().getShopNumber() + " and cannot be served at Shop " + shop.getShopNumber());
        }

        String currentMonth = entitlementService.getCurrentEntitlementMonth();

        // 4. Validate Each Item Against Remaining Entitlements and Available Stock
        for (DistributionItemRequest itemReq : req.getItems()) {
            Commodity comm = commodityRepository.findById(itemReq.getCommodityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commodity not found with ID: " + itemReq.getCommodityId()));

            MonthlyEntitlement me = monthlyEntitlementRepository
                    .findByRationCardIdAndCommodityIdAndEntitlementMonth(card.getId(), comm.getId(), currentMonth)
                    .orElseThrow(() -> new BadRequestException("No monthly entitlement found for commodity " + comm.getName() + " in month " + currentMonth));

            if (itemReq.getQuantity().compareTo(me.getRemainingQuantity()) > 0) {
                throw new EntitlementExceededException("Requested quantity " + itemReq.getQuantity() + " " + comm.getMeasurementUnit() +
                        " exceeds remaining entitlement limit of " + me.getRemainingQuantity() + " " + comm.getMeasurementUnit() +
                        " for commodity " + comm.getName());
            }

            BigDecimal totalAvailableStock = stockBatchRepository.getTotalAvailableStock(shopId, comm.getId());
            if (itemReq.getQuantity().compareTo(totalAvailableStock) > 0) {
                throw new InsufficientStockException("Shop " + shop.getShopNumber() + " has only " + totalAvailableStock +
                        " " + comm.getMeasurementUnit() + " of " + comm.getName() + " in stock. Cannot distribute " + itemReq.getQuantity());
            }
        }

        // 5. Build Distribution Record
        String txnRef = "TXN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) +
                "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Distribution distribution = Distribution.builder()
                .transactionReference(txnRef)
                .idempotencyKey(req.getIdempotencyKey())
                .rationCard(card)
                .shop(shop)
                .distributedByUser(currentUser)
                .distributionDate(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .status("COMPLETED")
                .lifecycleState("COMPLETED")
                .receiptNotes(req.getReceiptNotes())
                .items(new ArrayList<>())
                .build();

        BigDecimal runningTotalAmount = BigDecimal.ZERO;

        // 6. Deduct Stock via FIFO, Update Entitlement, Create Stock Movement
        for (DistributionItemRequest itemReq : req.getItems()) {
            Commodity comm = commodityRepository.findById(itemReq.getCommodityId()).get();
            MonthlyEntitlement me = monthlyEntitlementRepository
                    .findByRationCardIdAndCommodityIdAndEntitlementMonth(card.getId(), comm.getId(), currentMonth).get();

            BigDecimal unitPrice = comm.getSubsidizedPrice();
            if (me.getRule() != null && me.getRule().getPricePerUnit() != null) {
                unitPrice = me.getRule().getPricePerUnit();
            }

            BigDecimal itemTotalPrice = unitPrice.multiply(itemReq.getQuantity());
            runningTotalAmount = runningTotalAmount.add(itemTotalPrice);

            // Deduct stock batches FIFO
            BigDecimal remainingToDeduct = itemReq.getQuantity();
            List<StockBatch> batches = stockBatchRepository
                    .findByShopIdAndCommodityIdAndAvailableQuantityGreaterThanOrderByReceivedDateAsc(shopId, comm.getId(), BigDecimal.ZERO);

            StockBatch primaryBatch = null;
            for (StockBatch b : batches) {
                if (remainingToDeduct.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal canDeduct = b.getAvailableQuantity().min(remainingToDeduct);
                b.setAvailableQuantity(b.getAvailableQuantity().subtract(canDeduct));
                remainingToDeduct = remainingToDeduct.subtract(canDeduct);
                stockBatchRepository.save(b);
                if (primaryBatch == null) primaryBatch = b;
            }

            // Update remaining and distributed monthly entitlement
            me.setDistributedQuantity(me.getDistributedQuantity().add(itemReq.getQuantity()));
            me.setRemainingQuantity(me.getRemainingQuantity().subtract(itemReq.getQuantity()).max(BigDecimal.ZERO));
            me.setLastDistributedAt(LocalDateTime.now());
            monthlyEntitlementRepository.save(me);

            // Create DistributionItem
            DistributionItem item = DistributionItem.builder()
                    .distribution(distribution)
                    .commodity(comm)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotalPrice)
                    .stockBatch(primaryBatch)
                    .build();

            distribution.getItems().add(item);

            // Record Traceable Stock Movement
            BigDecimal balanceAfter = stockBatchRepository.getTotalAvailableStock(shopId, comm.getId());
            StockMovement movement = StockMovement.builder()
                    .shop(shop)
                    .commodity(comm)
                    .movementType(StockMovementType.DISTRIBUTION_OUTWARD)
                    .quantity(itemReq.getQuantity().negate())
                    .balanceAfter(balanceAfter)
                    .batch(primaryBatch)
                    .referenceId(txnRef)
                    .reason("Distribution to Cardholder: " + card.getHeadOfFamily() + " (" + card.getCardNumber() + ")")
                    .performedByUser(currentUser)
                    .createdAt(LocalDateTime.now())
                    .build();

            stockMovementRepository.save(movement);

            // Check low stock condition
            stockService.checkAndTriggerLowStockAlert(shop, comm, balanceAfter);
        }

        distribution.setTotalAmount(runningTotalAmount);
        Distribution savedDistribution = distributionRepository.save(distribution);

        // Link active slot booking if exists for this card on today's date
        if (rationBookingRepository != null) {
            try {
                rationBookingRepository.findByRationCardIdOrderByBookingDateDesc(card.getId()).stream()
                        .filter(b -> "CONFIRMED".equals(b.getStatus()) && b.getBookingDate().equals(LocalDate.now()))
                        .findFirst()
                        .ifPresent(b -> {
                            b.setStatus("COMPLETED");
                            b.setDistribution(savedDistribution);
                            rationBookingRepository.save(b);
                        });
            } catch (Exception e) {
                log.warn("Could not link active booking: {}", e.getMessage());
            }
        }

        // 7. Audit Log
        auditLogService.logAction(currentUser, "DISTRIBUTE_COMMODITIES", "DISTRIBUTION",
                savedDistribution.getTransactionReference(), shop.getId(),
                "Distributed commodities worth Rs. " + savedDistribution.getTotalAmount() + " to card " + card.getCardNumber(), ipAddress);

        // 8. Notification to Beneficiary
        String notifMsg = "Distribution confirmed for " + card.getCardNumber() + ". Ref: " + txnRef +
                ", Amount: Rs. " + savedDistribution.getTotalAmount() + " at " + shop.getShopName();
        notificationService.createNotification(null, "BENEFICIARY", shop.getId(),
                "Ration Distribution Receipt", notifMsg, NotificationType.DISTRIBUTION_SUCCESS);

        DistributionResponse response = mapToResponse(savedDistribution);

        // 9. Real-Time Dashboard Live Stream Event
        sseService.broadcastEvent("DISTRIBUTION_COMPLETED", response);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<DistributionResponse> getDistributions(Long shopId, Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        return distributionRepository.findByShopIdOrderByDistributionDateDesc(shopId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<DistributionResponse> getDistributionsForCard(Long cardId) {
        return distributionRepository.findByRationCardIdOrderByDistributionDateDesc(cardId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReceiptDto getReceipt(String txnRef) {
        Distribution dist = distributionRepository.findByTransactionReference(txnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Distribution not found with reference: " + txnRef));

        return ReceiptDto.builder()
                .transactionReference(dist.getTransactionReference())
                .shopNumber(dist.getShop().getShopNumber())
                .shopName(dist.getShop().getShopName())
                .shopAddress(dist.getShop().getAddress())
                .shopContact(dist.getShop().getContactPhone())
                .cardNumber(dist.getRationCard().getCardNumber())
                .headOfFamily(dist.getRationCard().getHeadOfFamily())
                .cardCategory(dist.getRationCard().getCardCategory().name())
                .familyMembers(dist.getRationCard().getFamilyMemberCount())
                .distributionDate(dist.getDistributionDate())
                .operatorName(dist.getDistributedByUser() != null ? dist.getDistributedByUser().getFullName() : "Authorized Operator")
                .totalAmount(dist.getTotalAmount())
                .receiptNotes(dist.getReceiptNotes())
                .items(mapItems(dist.getItems()))
                .build();
    }

    private DistributionResponse mapToResponse(Distribution d) {
        return DistributionResponse.builder()
                .id(d.getId())
                .transactionReference(d.getTransactionReference())
                .idempotencyKey(d.getIdempotencyKey())
                .rationCardId(d.getRationCard().getId())
                .cardNumber(d.getRationCard().getCardNumber())
                .headOfFamily(d.getRationCard().getHeadOfFamily())
                .shopId(d.getShop().getId())
                .shopNumber(d.getShop().getShopNumber())
                .shopName(d.getShop().getShopName())
                .distributedBy(d.getDistributedByUser() != null ? d.getDistributedByUser().getFullName() : "Operator")
                .distributionDate(d.getDistributionDate())
                .totalAmount(d.getTotalAmount())
                .status(d.getStatus())
                .receiptNotes(d.getReceiptNotes())
                .items(mapItems(d.getItems()))
                .build();
    }

    private List<DistributionResponse.DistributionItemDto> mapItems(List<DistributionItem> items) {
        if (items == null) return new ArrayList<>();
        return items.stream()
                .map(i -> DistributionResponse.DistributionItemDto.builder()
                        .id(i.getId())
                        .commodityId(i.getCommodity().getId())
                        .commodityName(i.getCommodity().getName())
                        .measurementUnit(i.getCommodity().getMeasurementUnit())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .batchNumber(i.getStockBatch() != null ? i.getStockBatch().getBatchNumber() : "DIRECT")
                        .build())
                .collect(Collectors.toList());
    }
}
