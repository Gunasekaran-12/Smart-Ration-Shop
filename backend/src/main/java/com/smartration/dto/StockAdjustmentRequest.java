package com.smartration.dto;

import com.smartration.entity.enums.StockMovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentRequest {
    private Long shopId;

    @NotNull(message = "Commodity ID is required")
    private Long commodityId;

    private Long batchId; // Optional specific batch

    @NotNull(message = "Adjustment type is required")
    private StockMovementType movementType; // ADJUSTMENT_DAMAGE, ADJUSTMENT_CORRECTION, ADJUSTMENT_TRANSFER

    @NotNull(message = "Adjustment quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotBlank(message = "Adjustment reason is mandatory for audit compliance")
    private String reason;
}
