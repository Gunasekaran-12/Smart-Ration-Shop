package com.smartration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpGenerateRequest {

    @NotNull(message = "Ration card ID is required")
    private Long rationCardId;

    @NotNull(message = "Shop ID is required")
    private Long shopId;

    private String requestedItemsJson;
}

