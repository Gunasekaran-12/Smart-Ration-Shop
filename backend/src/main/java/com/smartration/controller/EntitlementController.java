package com.smartration.controller;

import com.smartration.dto.EntitlementRuleRequest;
import com.smartration.entity.EntitlementRule;
import com.smartration.service.EntitlementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entitlements")
@RequiredArgsConstructor
public class EntitlementController {

    private final EntitlementService entitlementService;

    @GetMapping("/rules")
    public ResponseEntity<List<EntitlementRule>> getAllRules() {
        return ResponseEntity.ok(entitlementService.getAllRules());
    }

    @PostMapping("/rules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<EntitlementRule> saveRule(@Valid @RequestBody EntitlementRuleRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(entitlementService.saveRule(request, httpRequest.getRemoteAddr()));
    }
}
