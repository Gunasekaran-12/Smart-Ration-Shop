package com.smartration.dto;

import com.smartration.entity.enums.CalculationType;
import com.smartration.entity.enums.CardCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntitlementRuleRequest {
    @NotNull(message = "Card category is required")
    private CardCategory cardCategory;

    @NotNull(message = "Commodity ID is required")
    private Long commodityId;

    @NotNull(message = "Calculation type is required")
    private CalculationType calculationType;

    @NotNull(message = "Base quantity is required")
    @DecimalMin(value = "0.01", message = "Base quantity must be greater than zero")
    private BigDecimal baseQuantity;

    private BigDecimal maxQuantity;

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal pricePerUnit;

    private LocalDate effectiveFrom;
    private Boolean isActive;
}
