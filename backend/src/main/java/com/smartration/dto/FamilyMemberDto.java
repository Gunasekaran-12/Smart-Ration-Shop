package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberDto {
    private Long id;

    @NotBlank(message = "Family member full name is required")
    private String fullName;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    @NotNull(message = "Age is required")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;
}
