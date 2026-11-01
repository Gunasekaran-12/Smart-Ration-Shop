package com.smartration.controller;

import com.smartration.dto.DistributionRequest;
import com.smartration.dto.DistributionResponse;
import com.smartration.dto.ReceiptDto;
import com.smartration.service.DistributionService;
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
@RequestMapping("/api/distributions")
@RequiredArgsConstructor
public class DistributionController {

    private final DistributionService distributionService;

    @GetMapping
    public ResponseEntity<Page<DistributionResponse>> getDistributions(
            @RequestParam(defaultValue = "1") Long shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(distributionService.getDistributions(shopId, PageRequest.of(page, size)));
    }

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<DistributionResponse>> getDistributionsForCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(distributionService.getDistributionsForCard(cardId));
    }

    @GetMapping("/receipt/{txnRef}")
    public ResponseEntity<ReceiptDto> getReceipt(@PathVariable String txnRef) {
        return ResponseEntity.ok(distributionService.getReceipt(txnRef));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<DistributionResponse> processDistribution(
            @Valid @RequestBody DistributionRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(distributionService.processDistribution(request, httpRequest.getRemoteAddr()));
    }
}
