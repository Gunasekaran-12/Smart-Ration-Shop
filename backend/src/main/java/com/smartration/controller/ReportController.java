package com.smartration.controller;

import com.smartration.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/reconciliation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR')")
    public ResponseEntity<Map<String, Object>> getReconciliation(@RequestParam(required = false) Long shopId) {
        return ResponseEntity.ok(reportService.getReconciliationReport(shopId));
    }

    @GetMapping("/export/distributions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR')")
    public ResponseEntity<InputStreamResource> exportDistributionsCsv(
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        ByteArrayInputStream csvStream = reportService.generateDistributionReportCsv(shopId, startDate, endDate);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=distributions_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(csvStream));
    }

    @GetMapping("/export/ledger")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR')")
    public ResponseEntity<InputStreamResource> exportStockLedgerCsv(@RequestParam(required = false) Long shopId) {
        ByteArrayInputStream csvStream = reportService.generateStockLedgerCsv(shopId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=stock_ledger.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(csvStream));
    }
}
