package com.smartration.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTrendDto {
    private String month; // e.g. "May", "Jun", "Jul", "Aug", "Sep", "Oct"
    private BigDecimal riceDistributed;
    private BigDecimal wheatDistributed;
    private BigDecimal sugarDistributed;
    private BigDecimal dalDistributed;
    private Long transactionsCount;
}
