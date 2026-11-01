package com.smartration.controller;

import com.smartration.dto.CardEntitlementDto;
import com.smartration.dto.RationCardRequest;
import com.smartration.dto.RationCardResponse;
import com.smartration.entity.RationCard;
import com.smartration.entity.enums.CardCategory;
import com.smartration.repository.RationCardRepository;
import com.smartration.service.EntitlementService;
import com.smartration.service.RationCardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ration-cards")
@RequiredArgsConstructor
public class RationCardController {

    private final RationCardService rationCardService;
    private final EntitlementService entitlementService;
    private final RationCardRepository rationCardRepository;

    @GetMapping
    public ResponseEntity<Page<RationCardResponse>> getCards(
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) CardCategory category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<RationCardResponse> result = rationCardService.searchCards(
                shopId, category, query, PageRequest.of(page, size, Sort.by("id").descending()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RationCardResponse> getCardById(@PathVariable Long id) {
        return ResponseEntity.ok(rationCardService.getCardById(id));
    }

    @GetMapping("/search/{cardNumber}")
    public ResponseEntity<RationCardResponse> getCardByNumber(@PathVariable String cardNumber) {
        return ResponseEntity.ok(rationCardService.getCardByNumber(cardNumber));
    }

    @GetMapping("/{id}/entitlements")
    public ResponseEntity<List<CardEntitlementDto>> getCardEntitlements(@PathVariable Long id) {
        RationCard card = rationCardRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(entitlementService.getCardEntitlementsForCurrentMonth(card));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<RationCardResponse> createCard(@Valid @RequestBody RationCardRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(rationCardService.createCard(request, httpRequest.getRemoteAddr()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<RationCardResponse> updateCard(@PathVariable Long id, @Valid @RequestBody RationCardRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(rationCardService.updateCard(id, request, httpRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<RationCardResponse> toggleCardStatus(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(rationCardService.toggleCardStatus(id, httpRequest.getRemoteAddr()));
    }
}
