package com.smartration.dto;

import com.smartration.entity.enums.ComplaintCategory;
import com.smartration.entity.enums.ComplaintStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private Long id;
    private String complaintNumber;
    private Long rationCardId;
    private String cardNumber;
    private String beneficiaryName;
    private Long shopId;
    private String shopName;
    private ComplaintCategory category;
    private String subject;
    private String description;
    private ComplaintStatus status;
    private String resolutionRemarks;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
