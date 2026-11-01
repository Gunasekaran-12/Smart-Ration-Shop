package com.smartration.controller;

import com.smartration.dto.BookingRequest;
import com.smartration.dto.BookingResponse;
import com.smartration.dto.SlotAvailabilityDto;
import com.smartration.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/slots")
    public ResponseEntity<List<SlotAvailabilityDto>> getAvailableSlots(
            @RequestParam Long shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(bookingService.getAvailableSlots(shopId, targetDate));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(bookingService.createBooking(request, httpRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY')")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest httpRequest
    ) {
        String reason = body != null ? body.get("reason") : "Cardholder requested cancellation";
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason, httpRequest.getRemoteAddr()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('BENEFICIARY', 'SUPER_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/shop/{shopId}")
    @PreAuthorize("hasAnyRole('SHOP_OPERATOR', 'SUPER_ADMIN', 'AUDITOR')")
    public ResponseEntity<List<BookingResponse>> getShopBookings(
            @PathVariable Long shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bookingService.getShopBookings(shopId, date));
    }
}

