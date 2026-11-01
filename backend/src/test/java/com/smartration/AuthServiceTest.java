package com.smartration;

import com.smartration.dto.AuthResponse;
import com.smartration.dto.BeneficiaryLoginRequest;
import com.smartration.entity.RationCard;
import com.smartration.entity.RationShop;
import com.smartration.entity.User;
import com.smartration.entity.enums.CardCategory;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.UserRepository;
import com.smartration.security.JwtTokenProvider;
import com.smartration.service.AuditLogService;
import com.smartration.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RationCardRepository rationCardRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private RationCard demoCard;
    private User demoBeneficiaryUser;

    @BeforeEach
    void setUp() {
        RationShop shop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Test Shop").build();

        demoCard = RationCard.builder()
                .id(1L)
                .cardNumber("RC-KA-01-456123")
                .headOfFamily("Ramesh Sharma")
                .cardCategory(CardCategory.BPL)
                .familyMemberCount(4)
                .shop(shop)
                .isActive(true)
                .dateOfBirth(LocalDate.of(1982, 5, 14))
                .build();

        demoBeneficiaryUser = User.builder()
                .id(10L)
                .username("RC-KA-01-456123")
                .passwordHash("$2a$10$hashedInitial")
                .fullName("Ramesh Sharma")
                .role(Role.BENEFICIARY)
                .shop(shop)
                .rationCardId(1L)
                .isActive(true)
                .isTemporaryPassword(true)
                .build();
    }

    @Test
    void testInitialPasswordDerivationRule() {
        // Card 1: Ramesh Sharma (1982-05-14) -> RAME1982
        assertEquals("RAME1982", AuthService.deriveInitialPassword("Ramesh Sharma", LocalDate.of(1982, 5, 14)));

        // Card 2: Suresh Kumar (1982-05-14) -> SURE1982
        assertEquals("SURE1982", AuthService.deriveInitialPassword("Suresh Kumar", LocalDate.of(1982, 5, 14)));

        // Card 3: Lakshmi Bai (1964-08-25) -> LAKS1964
        assertEquals("LAKS1964", AuthService.deriveInitialPassword("Lakshmi Bai", LocalDate.of(1964, 8, 25)));

        // Card 4: Mohammed Rafiq (1976-12-10) -> MOHA1976
        assertEquals("MOHA1976", AuthService.deriveInitialPassword("Mohammed Rafiq", LocalDate.of(1976, 12, 10)));

        // Card 5: Sunita Patil (1985-04-18) -> SUNI1985
        assertEquals("SUNI1985", AuthService.deriveInitialPassword("Sunita Patil", LocalDate.of(1985, 4, 18)));

        // Card 6: Anand Hegde (1980-07-03) -> ANAN1980
        assertEquals("ANAN1980", AuthService.deriveInitialPassword("Anand Hegde", LocalDate.of(1980, 7, 3)));

        // Short name: Om -> OMXX1995 (padded to 4 characters without crashing)
        assertEquals("OMXX1995", AuthService.deriveInitialPassword("Om", LocalDate.of(1995, 1, 1)));
    }

    @Test
    void testValidBeneficiaryLoginWithInitialCredentials() {
        when(rationCardRepository.findByCardNumberIgnoreCase("RC-KA-01-456123")).thenReturn(Optional.of(demoCard));
        when(userRepository.findByRationCardId(1L)).thenReturn(Optional.of(demoBeneficiaryUser));
        when(passwordEncoder.matches("RAME1982", "$2a$10$hashedInitial")).thenReturn(true);
        when(tokenProvider.generateToken(any())).thenReturn("mock-jwt-token");

        BeneficiaryLoginRequest request = BeneficiaryLoginRequest.builder()
                .cardNumber("RC-KA-01-456123")
                .dateOfBirth("14-05-1982") // Tests DD-MM-YYYY format handling
                .password("RAME1982")
                .build();

        AuthResponse response = authService.beneficiaryLogin(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("RC-KA-01-456123", response.getUsername());
        assertEquals(Role.BENEFICIARY, response.getRole());
        assertTrue(response.getIsTemporaryPassword());
    }

    @Test
    void testBeneficiaryLoginIncorrectPasswordRejected() {
        when(rationCardRepository.findByCardNumberIgnoreCase("RC-KA-01-456123")).thenReturn(Optional.of(demoCard));
        when(userRepository.findByRationCardId(1L)).thenReturn(Optional.of(demoBeneficiaryUser));
        when(passwordEncoder.matches("WRONGPASS", "$2a$10$hashedInitial")).thenReturn(false);

        BeneficiaryLoginRequest request = BeneficiaryLoginRequest.builder()
                .cardNumber("RC-KA-01-456123")
                .dateOfBirth("1982-05-14")
                .password("WRONGPASS")
                .build();

        assertThrows(BadRequestException.class, () -> authService.beneficiaryLogin(request, "127.0.0.1"));
    }

    @Test
    void testBeneficiaryLoginIncorrectDobRejected() {
        when(rationCardRepository.findByCardNumberIgnoreCase("RC-KA-01-456123")).thenReturn(Optional.of(demoCard));

        BeneficiaryLoginRequest request = BeneficiaryLoginRequest.builder()
                .cardNumber("RC-KA-01-456123")
                .dateOfBirth("1999-01-01") // Does not match 1982-05-14
                .password("RAME1982")
                .build();

        assertThrows(BadRequestException.class, () -> authService.beneficiaryLogin(request, "127.0.0.1"));
    }

    @Test
    void testBeneficiaryLoginPermanentPasswordValidation() {
        demoBeneficiaryUser.setIsTemporaryPassword(false);
        demoBeneficiaryUser.setPasswordHash("$2a$10$hashedPermanent");

        when(rationCardRepository.findByCardNumberIgnoreCase("RC-KA-01-456123")).thenReturn(Optional.of(demoCard));
        when(userRepository.findByRationCardId(1L)).thenReturn(Optional.of(demoBeneficiaryUser));
        when(passwordEncoder.matches("MyPermanentPass123", "$2a$10$hashedPermanent")).thenReturn(true);
        when(tokenProvider.generateToken(any())).thenReturn("mock-jwt-permanent");

        BeneficiaryLoginRequest request = BeneficiaryLoginRequest.builder()
                .cardNumber("RC-KA-01-456123")
                .dateOfBirth("1982-05-14")
                .password("MyPermanentPass123")
                .build();

        AuthResponse response = authService.beneficiaryLogin(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("mock-jwt-permanent", response.getToken());
        assertFalse(response.getIsTemporaryPassword());
    }
}

