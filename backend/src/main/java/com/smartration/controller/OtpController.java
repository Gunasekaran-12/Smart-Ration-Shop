package com.smartration.controller;

import com.smartration.dto.OtpGenerateRequest;
import com.smartration.dto.OtpResponse;
import com.smartration.dto.OtpVerifyRequest;
import com.smartration.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<OtpResponse> generateOtp(@Valid @RequestBody OtpGenerateRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(otpService.generateOtp(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_OPERATOR')")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(otpService.verifyOtp(request, httpRequest.getRemoteAddr()));
    }
}

