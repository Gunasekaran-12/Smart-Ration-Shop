package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommodityDistributionDto {
    private String name;
    private BigDecimal value;
    private String unit;
    private String color;
}
