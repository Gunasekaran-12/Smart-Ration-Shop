package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConflictResolutionRequest {

    @NotBlank(message = "Resolution action is required (RECONCILED or REJECTED)")
    private String action; // RECONCILED, REJECTED

    private BigDecimal approvedAdjustment;

    @NotBlank(message = "Resolution notes are required")
    private String resolutionNotes;
}

