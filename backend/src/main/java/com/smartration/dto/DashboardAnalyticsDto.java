package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDto {
    private Long totalRationCards;
    private Long activeShops;
    private Long todayTransactions;
    private BigDecimal todayDistributedKg;
    private Long lowStockCount;
    private BigDecimal totalStockReceivedThisMonth;
    private List<StockSummaryDto> commodityStock;
    private List<MonthlyTrendDto> monthlyDistributionTrends;
    private List<CommodityDistributionDto> commodityDistributionBreakdown;
    private List<ShopComparisonDto> shopComparisons;
    private List<StockMovementDto> recentStockMovements;
    private List<DistributionResponse> recentDistributions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockMovementDto {
        private Long id;
        private String shopName;
        private String commodityName;
        private String measurementUnit;
        private String movementType;
        private BigDecimal quantity;
        private BigDecimal balanceAfter;
        private String referenceId;
        private String reason;
        private String performedBy;
        private String createdAt;
    }
}
