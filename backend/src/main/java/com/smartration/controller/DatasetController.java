package com.smartration.controller;

import com.smartration.dto.WeeklyDatasetDto;
import com.smartration.service.DatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/datasets")
@RequiredArgsConstructor
public class DatasetController {

    private final DatasetService datasetService;

    @GetMapping("/{month}/week-{weekNumber}")
    public ResponseEntity<WeeklyDatasetDto> getWeeklyDataset(
            @PathVariable String month,
            @PathVariable int weekNumber,
            @RequestParam(required = false) Long shopId
    ) {
        return ResponseEntity.ok(datasetService.getWeeklyDataset(month, weekNumber, shopId));
    }

    @GetMapping("/current")
    public ResponseEntity<WeeklyDatasetDto> getCurrentWeeklyDataset(@RequestParam(required = false) Long shopId) {
        int day = java.time.LocalDate.now().getDayOfMonth();
        int week = (day <= 7) ? 1 : ((day <= 14) ? 2 : ((day <= 21) ? 3 : 4));
        String month = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
        return ResponseEntity.ok(datasetService.getWeeklyDataset(month, week, shopId));
    }
}

