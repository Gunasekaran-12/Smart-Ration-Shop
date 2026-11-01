package com.smartration.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long rationCardId;
    private String cardNumber;
    private String headOfFamily;
    private Long shopId;
    private String shopName;
    private Long slotId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String cancellationReason;
    private String reservedCommoditiesJson;
    private Long distributionId;
    private LocalDateTime createdAt;

    public String getSlotTime() {
        if (startTime != null && endTime != null) {
            return startTime.toString().substring(0, 5) + " - " + endTime.toString().substring(0, 5);
        }
        return null;
    }

    public LocalDate getSlotDate() {
        return bookingDate;
    }
}
