package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDto {
    private String transactionReference;
    private String shopNumber;
    private String shopName;
    private String shopAddress;
    private String shopContact;
    private String cardNumber;
    private String headOfFamily;
    private String cardCategory;
    private Integer familyMembers;
    private LocalDateTime distributionDate;
    private String operatorName;
    private BigDecimal totalAmount;
    private String receiptNotes;
    private List<DistributionResponse.DistributionItemDto> items;
}
