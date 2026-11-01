package com.smartration.controller;

import com.smartration.entity.RationShop;
import com.smartration.service.ShopService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public ResponseEntity<List<RationShop>> getAllShops() {
        return ResponseEntity.ok(shopService.getAllShops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RationShop> getShopById(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<RationShop> createShop(@Valid @RequestBody RationShop shop, HttpServletRequest request) {
        return ResponseEntity.ok(shopService.createShop(shop, request.getRemoteAddr()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<RationShop> updateShop(@PathVariable Long id, @Valid @RequestBody RationShop shop, HttpServletRequest request) {
        return ResponseEntity.ok(shopService.updateShop(id, shop, request.getRemoteAddr()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<RationShop> toggleShopStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            HttpServletRequest request
    ) {
        boolean isOpen = body.getOrDefault("isOpen", true);
        return ResponseEntity.ok(shopService.toggleShopStatus(id, isOpen, request.getRemoteAddr()));
    }
}
