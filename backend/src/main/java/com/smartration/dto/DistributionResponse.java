package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionResponse {
    private Long id;
    private String transactionReference;
    private String idempotencyKey;
    private Long rationCardId;
    private String cardNumber;
    private String headOfFamily;
    private Long shopId;
    private String shopNumber;
    private String shopName;
    private String distributedBy;
    private LocalDateTime distributionDate;
    private BigDecimal totalAmount;
    private String status;
    private String receiptNotes;
    private List<DistributionItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DistributionItemDto {
        private Long id;
        private Long commodityId;
        private String commodityName;
        private String measurementUnit;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String batchNumber;
    }
}
