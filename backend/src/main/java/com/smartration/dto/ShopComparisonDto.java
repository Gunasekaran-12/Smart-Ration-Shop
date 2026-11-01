package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopComparisonDto {
    private Long shopId;
    private String shopNumber;
    private String shopName;
    private Long cardCount;
    private BigDecimal stockAvailableKg;
    private BigDecimal monthlyDistributedKg;
    private Long transactionsCount;
    private Long pendingComplaints;
}
