package com.smartration.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionRequest {

    @NotNull(message = "Ration card ID is required")
    private Long rationCardId;

    private Long shopId; // Inferred from authenticated operator if not provided

    private String idempotencyKey;

    private String receiptNotes;

    @NotEmpty(message = "At least one commodity must be selected for distribution")
    @Valid
    private List<DistributionItemRequest> items;
}
