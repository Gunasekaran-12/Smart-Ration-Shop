package com.smartration.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommodityRequest {
    @NotBlank(message = "Commodity code is required")
    private String code;

    @NotBlank(message = "Commodity name is required")
    private String name;

    @NotBlank(message = "Measurement unit is required (KG, LITRE)")
    private String measurementUnit;

    @NotNull(message = "Subsidized price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal subsidizedPrice;

    @NotNull(message = "Low stock threshold is required")
    @DecimalMin(value = "0.0", message = "Threshold cannot be negative")
    private BigDecimal lowStockThreshold;

    private Boolean isActive;
}
