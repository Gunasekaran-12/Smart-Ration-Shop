package com.smartration.dto;

import com.smartration.entity.enums.CardCategory;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RationCardResponse {
    private Long id;
    private String cardNumber;
    private String headOfFamily;
    private LocalDate dateOfBirth;
    private CardCategory cardCategory;
    private Integer familyMemberCount;
    private Long shopId;
    private String shopNumber;
    private String shopName;
    private String address;
    private String phoneNumber;
    private Boolean isActive;
    private List<FamilyMemberDto> familyMembers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
