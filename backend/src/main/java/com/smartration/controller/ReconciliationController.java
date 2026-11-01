package com.smartration.controller;

import com.smartration.dto.ConflictResolutionRequest;
import com.smartration.dto.ReconciliationRequest;
import com.smartration.entity.TransactionConflict;
import com.smartration.service.ReconciliationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR')")
    public ResponseEntity<List<TransactionConflict>> getConflicts(@RequestParam(required = false) Long shopId) {
        return ResponseEntity.ok(reconciliationService.getAllConflicts(shopId));
    }

    @PostMapping("/raise")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR')")
    public ResponseEntity<TransactionConflict> raiseConflict(
            @Valid @RequestBody ReconciliationRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(reconciliationService.raiseConflict(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/conflicts/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR')")
    public ResponseEntity<TransactionConflict> resolveConflict(
            @PathVariable Long id,
            @Valid @RequestBody ConflictResolutionRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(reconciliationService.resolveConflict(id, request, httpRequest.getRemoteAddr()));
    }
}

