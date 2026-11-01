package com.smartration.service;

import com.smartration.dto.AuthRequest;
import com.smartration.dto.AuthResponse;
import com.smartration.dto.BeneficiaryLoginRequest;
import com.smartration.dto.PasswordSetupRequest;
import com.smartration.entity.RationCard;
import com.smartration.entity.User;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.UserRepository;
import com.smartration.security.JwtTokenProvider;
import com.smartration.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RationCardRepository rationCardRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(AuthRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String cardNumber = null;
        if (user.getRationCardId() != null) {
            cardNumber = rationCardRepository.findById(user.getRationCardId())
                    .map(RationCard::getCardNumber)
                    .orElse(null);
        }

        auditLogService.logAction(user, "USER_LOGIN", "USER", user.getId().toString(),
                user.getShop() != null ? user.getShop().getId() : null,
                "User successfully logged in via credentials", ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .shopId(user.getShop() != null ? user.getShop().getId() : null)
                .shopName(user.getShop() != null ? user.getShop().getShopName() : null)
                .rationCardId(user.getRationCardId())
                .cardNumber(cardNumber)
                .isTemporaryPassword(Boolean.TRUE.equals(user.getIsTemporaryPassword()))
                .build();
    }

    /**
     * Authenticates a Beneficiary citizen via Ration Card Number + Date of Birth + Password.
     * For users who have not yet set a permanent password, accepts the statutory initial-password format:
     * First 4 letters of the registered Head of Family's name + 4-digit Birth Year.
     */
    @Transactional
    public AuthResponse beneficiaryLogin(BeneficiaryLoginRequest request, String ipAddress) {
        if (request == null) {
            throw new BadRequestException("Login request payload cannot be empty");
        }
        if (request.getCardNumber() == null || request.getCardNumber().trim().isEmpty()) {
            throw new BadRequestException("Ration card number is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Password is required");
        }

        // 1. Normalize and verify Ration Card Number
        String cardInput = request.getCardNumber().trim().toUpperCase();
        RationCard card = rationCardRepository.findByCardNumberIgnoreCase(cardInput)
                .orElseThrow(() -> new BadRequestException("Invalid Ration Card Number or card not found on official records"));

        if (!Boolean.TRUE.equals(card.getIsActive())) {
            throw new BadRequestException("This Ration Card is currently suspended or inactive. Please contact your Fair Price Shop inspector.");
        }

        // 2. Verify Date of Birth
        LocalDate requestDob = request.getParsedDateOfBirth();
        if (requestDob == null) {
            throw new BadRequestException("Valid Date of Birth (DD-MM-YYYY or YYYY-MM-DD) is required for beneficiary verification");
        }
        if (card.getDateOfBirth() != null && !card.getDateOfBirth().equals(requestDob)) {
            throw new BadRequestException("Date of Birth does not match official cardholder records");
        }

        // 3. Find or provision the Beneficiary User account
        User user = userRepository.findByRationCardId(card.getId())
                .orElseGet(() -> userRepository.findByUsername(card.getCardNumber())
                        .orElseGet(() -> {
                            String initialPwd = deriveInitialPassword(card.getHeadOfFamily(), card.getDateOfBirth());
                            User newBeneficiary = User.builder()
                                    .username(card.getCardNumber())
                                    .passwordHash(passwordEncoder.encode(initialPwd))
                                    .fullName(card.getHeadOfFamily())
                                    .phone(card.getPhoneNumber())
                                    .role(Role.BENEFICIARY)
                                    .shop(card.getShop())
                                    .rationCardId(card.getId())
                                    .isActive(true)
                                    .isTemporaryPassword(true)
                                    .build();
                            return userRepository.save(newBeneficiary);
                        })
                );

        // 4. Validate Credentials (Permanent vs. Statutory Initial)
        String enteredPassword = request.getPassword().trim();
        String initialPassword = deriveInitialPassword(card.getHeadOfFamily(), card.getDateOfBirth());
        boolean matches = false;

        // If beneficiary has established a permanent password
        if (Boolean.FALSE.equals(user.getIsTemporaryPassword())) {
            matches = passwordEncoder.matches(enteredPassword, user.getPasswordHash());
        } else {
            // Beneficiary has not set a permanent password yet:
            // Check stored hash or statutory initial password format
            if (passwordEncoder.matches(enteredPassword, user.getPasswordHash()) || enteredPassword.equalsIgnoreCase(initialPassword)) {
                matches = true;
                // Keep password hash synchronized with canonical initial password
                if (!passwordEncoder.matches(enteredPassword, user.getPasswordHash())) {
                    user.setPasswordHash(passwordEncoder.encode(initialPassword));
                    user.setIsTemporaryPassword(true);
                    userRepository.save(user);
                }
            }
        }

        if (!matches) {
            throw new BadRequestException("Invalid credentials. Please verify your Ration Card Number, Date of Birth, and Password.");
        }

        // 5. Generate Authentication and JWT token
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        auditLogService.logAction(user, "BENEFICIARY_LOGIN", "RATION_CARD", card.getCardNumber(),
                card.getShop() != null ? card.getShop().getId() : null,
                "Beneficiary successfully authenticated into cardholder portal", ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .shopId(card.getShop() != null ? card.getShop().getId() : null)
                .shopName(card.getShop() != null ? card.getShop().getShopName() : null)
                .rationCardId(card.getId())
                .cardNumber(card.getCardNumber())
                .isTemporaryPassword(Boolean.TRUE.equals(user.getIsTemporaryPassword()))
                .build();
    }

    /**
     * Computes the statutory initial password:
     * First 4 letters of Head of Family (UPPERCASE) + 4-digit Birth Year.
     * Names shorter than 4 characters are safely padded with 'X'.
     * Example: Ramesh (1982) -> RAME1982
     * Example: Suresh Kumar (1982) -> SURE1982
     * Example: Om (1995) -> OMXX1995
     */
    public static String deriveInitialPassword(String headOfFamily, LocalDate dateOfBirth) {
        if (headOfFamily == null || headOfFamily.trim().isEmpty()) {
            headOfFamily = "CARD";
        }
        String clean = headOfFamily.replaceAll("[^A-Za-z]", "").toUpperCase();
        if (clean.isEmpty()) {
            clean = "CARD";
        }
        String prefix = clean.length() >= 4 ? clean.substring(0, 4) : (clean + "XXXX").substring(0, 4);
        int year = (dateOfBirth != null) ? dateOfBirth.getYear() : 1980;
        return prefix + year;
    }

    @Transactional
    public void setupPassword(PasswordSetupRequest request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            throw new BadRequestException("Authentication required to set password");
        }

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password verification failed");
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters in length");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        user.setIsTemporaryPassword(false);
        userRepository.save(user);

        auditLogService.logAction(user, "PASSWORD_UPDATE", "USER", user.getId().toString(),
                user.getShop() != null ? user.getShop().getId() : null,
                "User successfully updated account password to permanent credentials", null);
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return userRepository.findById(principal.getId()).orElse(null);
    }
}
