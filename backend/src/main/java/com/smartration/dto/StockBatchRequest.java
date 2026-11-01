package com.smartration.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockBatchRequest {
    private Long shopId;

    @NotNull(message = "Commodity ID is required")
    private Long commodityId;

    @NotBlank(message = "Batch number is required")
    private String batchNumber;

    @NotBlank(message = "Warehouse reference is required")
    private String warehouseRef;

    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
    private BigDecimal quantity;
}
