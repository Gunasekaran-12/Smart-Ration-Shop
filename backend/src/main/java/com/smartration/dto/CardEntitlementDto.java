package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardEntitlementDto {
    private Long commodityId;
    private String commodityCode;
    private String commodityName;
    private String measurementUnit;
    private BigDecimal unitPrice;
    private BigDecimal totalEntitledQuantity;
    private BigDecimal distributedQuantity;
    private BigDecimal remainingQuantity;
    private BigDecimal availableShopStock; // Real-time stock currently in shop
    private Boolean isEligibleForDistribution;
}
