package com.smartration.dto;

import com.smartration.entity.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintStatusRequest {
    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String resolutionRemarks;
}
