package com.smartration.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotAvailabilityDto {
    private Long slotId;
    private Long shopId;
    private String shopName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int maxCapacity;
    private int bookedCount;
    private int remainingCapacity;
    private boolean isAvailable;
    private boolean isActive;
}

