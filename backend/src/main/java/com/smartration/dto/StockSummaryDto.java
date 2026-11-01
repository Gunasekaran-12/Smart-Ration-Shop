package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSummaryDto {
    private Long commodityId;
    private String commodityCode;
    private String commodityName;
    private String measurementUnit;
    private BigDecimal currentStock;
    private BigDecimal lowStockThreshold;
    private Boolean isLowStock;
    private BigDecimal todayDistributed;
    private Double daysUntilStockout; // estimated days remaining
}
