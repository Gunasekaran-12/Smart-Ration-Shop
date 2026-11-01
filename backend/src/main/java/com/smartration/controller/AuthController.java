package com.smartration.controller;

import com.smartration.dto.AuthRequest;
import com.smartration.dto.AuthResponse;
import com.smartration.dto.BeneficiaryLoginRequest;
import com.smartration.dto.PasswordSetupRequest;
import com.smartration.entity.User;
import com.smartration.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/beneficiary-login")
    public ResponseEntity<AuthResponse> beneficiaryLogin(@Valid @RequestBody BeneficiaryLoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        AuthResponse response = authService.beneficiaryLogin(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/setup-password")
    public ResponseEntity<Map<String, String>> setupPassword(@Valid @RequestBody PasswordSetupRequest request) {
        authService.setupPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password successfully updated. Account is now secured."));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}
