package com.smartration.dto;

import com.smartration.entity.enums.ComplaintCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintRequest {
    private Long rationCardId;
    private Long shopId;

    @NotNull(message = "Category is required")
    private ComplaintCategory category;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;
}
