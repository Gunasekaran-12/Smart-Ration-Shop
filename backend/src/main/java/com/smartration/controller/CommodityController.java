package com.smartration.controller;

import com.smartration.dto.CommodityRequest;
import com.smartration.entity.Commodity;
import com.smartration.service.CommodityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commodities")
@RequiredArgsConstructor
public class CommodityController {

    private final CommodityService commodityService;

    @GetMapping
    public ResponseEntity<List<Commodity>> getAllCommodities() {
        return ResponseEntity.ok(commodityService.getAllCommodities());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Commodity>> getActiveCommodities() {
        return ResponseEntity.ok(commodityService.getActiveCommodities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commodity> getCommodityById(@PathVariable Long id) {
        return ResponseEntity.ok(commodityService.getCommodityById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Commodity> createCommodity(@Valid @RequestBody CommodityRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(commodityService.createCommodity(request, httpRequest.getRemoteAddr()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Commodity> updateCommodity(@PathVariable Long id, @Valid @RequestBody CommodityRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(commodityService.updateCommodity(id, request, httpRequest.getRemoteAddr()));
    }
}
