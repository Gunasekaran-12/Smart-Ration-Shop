package com.smartration;

import com.smartration.dto.OtpGenerateRequest;
import com.smartration.dto.OtpResponse;
import com.smartration.dto.OtpVerifyRequest;
import com.smartration.entity.OtpChallenge;
import com.smartration.entity.RationCard;
import com.smartration.entity.RationShop;
import com.smartration.exception.BadRequestException;
import com.smartration.repository.OtpChallengeRepository;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.RationShopRepository;
import com.smartration.service.AuditLogService;
import com.smartration.service.AuthService;
import com.smartration.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpChallengeRepository otpRepository;
    @Mock
    private RationCardRepository rationCardRepository;
    @Mock
    private RationShopRepository shopRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private AuthService authService;

    @InjectMocks
    private OtpService otpService;

    private RationCard card;
    private RationShop shop;

    @BeforeEach
    void setUp() {
        shop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Test Shop").build();
        card = RationCard.builder().id(10L).cardNumber("RC-001").shop(shop).build();
    }

    @Test
    @DisplayName("Generates 6-digit OTP and transaction reference")
    void testGenerateOtp() {
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(passwordEncoder.encode(any())).thenReturn("hashed-otp");
        when(otpRepository.save(any(OtpChallenge.class))).thenAnswer(i -> i.getArgument(0));

        OtpGenerateRequest req = OtpGenerateRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .build();

        OtpResponse res = otpService.generateOtp(req, "127.0.0.1");

        assertNotNull(res);
        assertTrue(res.getTransactionRef().startsWith("OTP-"));
        assertEquals(6, res.getDemoOtp().length());
        assertFalse(res.isVerified());
    }

    @Test
    @DisplayName("Throws exception when max OTP attempts (3) exceeded")
    void testMaxAttemptsExceeded() {
        OtpChallenge challenge = OtpChallenge.builder()
                .transactionRef("OTP-TEST")
                .rationCard(card)
                .shop(shop)
                .otpHash("hashed-123456")
                .attempts(3) // Already tried 3 times
                .maxAttempts(3)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isConsumed(false)
                .build();

        when(otpRepository.findByTransactionRef("OTP-TEST")).thenReturn(Optional.of(challenge));

        OtpVerifyRequest verifyReq = OtpVerifyRequest.builder()
                .transactionRef("OTP-TEST")
                .otp("123456")
                .build();

        assertThrows(BadRequestException.class, () -> otpService.verifyOtp(verifyReq, "127.0.0.1"));
    }
}

