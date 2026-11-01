package com.smartration.controller;

import com.smartration.dto.ComplaintRequest;
import com.smartration.dto.ComplaintResponse;
import com.smartration.dto.ComplaintStatusRequest;
import com.smartration.service.ComplaintService;
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
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody ComplaintRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(complaintService.createComplaint(request, httpRequest.getRemoteAddr()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {
        return ResponseEntity.ok(complaintService.getMyComplaints());
    }

    @GetMapping("/shop")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR', 'AUDITOR')")
    public ResponseEntity<Page<ComplaintResponse>> getShopComplaints(
            @RequestParam(defaultValue = "1") Long shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(complaintService.getShopComplaints(shopId, PageRequest.of(page, size)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR', 'AUDITOR')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, request, httpRequest.getRemoteAddr()));
    }
}
