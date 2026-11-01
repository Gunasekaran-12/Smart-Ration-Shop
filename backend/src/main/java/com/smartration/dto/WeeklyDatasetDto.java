package com.smartration.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyDatasetDto {
    private String datasetId;
    private String month;
    private int weekNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long shopId;
    private String shopName;
    private String shopStatus;
    private List<Map<String, Object>> commodityAvailability;
    private Map<String, Object> bookingCapacityOverview;
    private List<String> verifiedCollectionDates;
    private List<String> announcements;
    private String source;
    private String lastUpdated;
}

