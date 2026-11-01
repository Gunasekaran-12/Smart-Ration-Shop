package com.smartration.controller;

import com.smartration.dto.DashboardAnalyticsDto;
import com.smartration.service.AnalyticsService;
import com.smartration.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SseService sseService;

    @GetMapping
    public ResponseEntity<DashboardAnalyticsDto> getDashboardData(@RequestParam(required = false) Long shopId) {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics(shopId));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLiveEvents(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return sseService.subscribe(username);
    }
}
