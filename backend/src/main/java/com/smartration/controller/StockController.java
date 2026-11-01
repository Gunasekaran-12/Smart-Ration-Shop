package com.smartration.controller;

import com.smartration.dto.StockAdjustmentRequest;
import com.smartration.dto.StockBatchRequest;
import com.smartration.dto.StockSummaryDto;
import com.smartration.entity.StockBatch;
import com.smartration.entity.StockMovement;
import com.smartration.service.StockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/summary")
    public ResponseEntity<List<StockSummaryDto>> getStockSummary(@RequestParam(defaultValue = "1") Long shopId) {
        return ResponseEntity.ok(stockService.getShopStockSummary(shopId));
    }

    @GetMapping("/batches")
    public ResponseEntity<List<StockBatch>> getBatches(@RequestParam(defaultValue = "1") Long shopId) {
        return ResponseEntity.ok(stockService.getBatches(shopId));
    }

    @GetMapping("/movements")
    public ResponseEntity<Page<StockMovement>> getMovements(
            @RequestParam(defaultValue = "1") Long shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(stockService.getMovements(shopId, PageRequest.of(page, size)));
    }

    @PostMapping("/receive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<StockBatch> receiveStock(@Valid @RequestBody StockBatchRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(stockService.recordIncomingStock(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<StockMovement> adjustStock(@Valid @RequestBody StockAdjustmentRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(stockService.recordStockAdjustment(request, httpRequest.getRemoteAddr()));
    }
}
