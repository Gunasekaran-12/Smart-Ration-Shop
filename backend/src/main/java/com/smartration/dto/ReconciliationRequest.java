package com.smartration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReconciliationRequest {

    @NotNull(message = "Distribution ID is required")
    private Long distributionId;

    @NotNull(message = "Commodity ID is required")
    private Long commodityId;

    @NotNull(message = "Conflict type is required")
    private String conflictType;

    @NotNull(message = "Expected stock is required")
    private BigDecimal expectedStock;

    @NotNull(message = "Actual stock is required")
    private BigDecimal actualStock;

    private BigDecimal proposedCorrection;

    private String explanation;
}

