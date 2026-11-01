package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerifyRequest {

    @NotBlank(message = "Transaction reference is required")
    private String transactionRef;

    @NotBlank(message = "OTP code is required")
    private String otp;
}

