package com.smartration.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {
    private String transactionRef;
    private String message;
    private String demoOtp; // For local sandbox / testing demonstration
    private LocalDateTime expiresAt;
    private boolean isVerified;
}

