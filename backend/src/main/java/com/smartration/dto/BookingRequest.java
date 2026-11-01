package com.smartration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Ration card ID is required")
    private Long rationCardId;

    @NotNull(message = "Shop ID is required")
    private Long shopId;

    private Long slotId;

    private LocalDate bookingDate;
    private LocalDate slotDate;
    private String slotTime;

    private List<DistributionItemRequest> requestedItems;

    public LocalDate getEffectiveBookingDate() {
        return bookingDate != null ? bookingDate : slotDate;
    }
}
