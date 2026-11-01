package com.smartration.service;

import com.smartration.dto.StockSummaryDto;
import com.smartration.entity.*;
import com.smartration.entity.enums.Role;
import com.smartration.entity.enums.StockMovementType;
import com.smartration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DistributionRepository distributionRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CommodityRepository commodityRepository;
    private final RationShopRepository shopRepository;
    private final StockService stockService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public Map<String, Object> getReconciliationReport(Long requestedShopId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Long shopId = requestedShopId;
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }
        if (shopId == null) shopId = 1L;

        RationShop shop = shopRepository.findById(shopId).orElse(null);
        List<Commodity> commodities = commodityRepository.findByIsActiveTrue();
        List<Map<String, Object>> items = new ArrayList<>();

        for (Commodity c : commodities) {
            List<StockMovement> movements = stockMovementRepository.filterMovements(shopId, c.getId(), null, null);

            BigDecimal openingStock = BigDecimal.ZERO;
            BigDecimal inwardReceipts = BigDecimal.ZERO;
            BigDecimal distributions = BigDecimal.ZERO;
            BigDecimal adjustments = BigDecimal.ZERO;

            for (StockMovement m : movements) {
                if (m.getMovementType() == StockMovementType.INWARD_RECEIPT) {
                    inwardReceipts = inwardReceipts.add(m.getQuantity());
                } else if (m.getMovementType() == StockMovementType.DISTRIBUTION_OUTWARD) {
                    distributions = distributions.add(m.getQuantity().abs());
                } else {
                    adjustments = adjustments.add(m.getQuantity()); // negative or positive
                }
            }

            BigDecimal expectedStock = openingStock.add(inwardReceipts).subtract(distributions).add(adjustments);
            BigDecimal actualRecordedStock = stockService.getShopStockSummary(shopId).stream()
                    .filter(s -> s.getCommodityId().equals(c.getId()))
                    .findFirst()
                    .map(StockSummaryDto::getCurrentStock)
                    .orElse(BigDecimal.ZERO);

            BigDecimal discrepancy = actualRecordedStock.subtract(expectedStock);

            Map<String, Object> row = new HashMap<>();
            row.put("commodityId", c.getId());
            row.put("commodityName", c.getName());
            row.put("unit", c.getMeasurementUnit());
            row.put("openingStock", openingStock);
            row.put("inwardReceipts", inwardReceipts);
            row.put("distributions", distributions);
            row.put("adjustments", adjustments);
            row.put("expectedStock", expectedStock);
            row.put("actualRecordedStock", actualRecordedStock);
            row.put("discrepancy", discrepancy);
            row.put("status", discrepancy.compareTo(BigDecimal.ZERO) == 0 ? "BALANCED" : "DISCREPANCY_FLAGGED");

            items.add(row);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("shopId", shopId);
        result.put("shopName", shop != null ? shop.getShopName() : "Central Shop");
        result.put("generatedAt", LocalDateTime.now());
        result.put("reconciliationData", items);
        return result;
    }

    public ByteArrayInputStream generateDistributionReportCsv(Long shopId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<Distribution> distributions = distributionRepository.filterDistributions(shopId, start, end);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("Transaction Reference,Date,Shop Number,Shop Name,Card Number,Head of Family,Total Amount (INR),Status");
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Distribution d : distributions) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\"%n",
                        d.getTransactionReference(),
                        d.getDistributionDate().format(dtf),
                        d.getShop().getShopNumber(),
                        d.getShop().getShopName(),
                        d.getRationCard().getCardNumber(),
                        d.getRationCard().getHeadOfFamily(),
                        d.getTotalAmount(),
                        d.getStatus()
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateStockLedgerCsv(Long shopId) {
        List<StockMovement> movements = stockMovementRepository.filterMovements(shopId, null, null, null);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("Movement ID,Date,Shop,Commodity,Type,Quantity,Balance After,Reference ID,Reason,Performed By");
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (StockMovement m : movements) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,\"%s\",\"%s\",\"%s\"%n",
                        m.getId(),
                        m.getCreatedAt().format(dtf),
                        m.getShop().getShopName(),
                        m.getCommodity().getName(),
                        m.getMovementType().name(),
                        m.getQuantity(),
                        m.getBalanceAfter(),
                        m.getReferenceId() != null ? m.getReferenceId() : "",
                        m.getReason() != null ? m.getReason().replace("\"", "\"\"") : "",
                        m.getPerformedByUser() != null ? m.getPerformedByUser().getFullName() : "System"
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
