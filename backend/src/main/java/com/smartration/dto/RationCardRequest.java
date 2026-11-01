package com.smartration.dto;

import com.smartration.entity.enums.CardCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RationCardRequest {
    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @NotBlank(message = "Head of family is required")
    private String headOfFamily;

    private LocalDate dateOfBirth;

    @NotNull(message = "Card category is required")
    private CardCategory cardCategory;

    private Long shopId;
    private String address;
    private String phoneNumber;
    private Boolean isActive;

    @Valid
    private List<FamilyMemberDto> familyMembers;
}
