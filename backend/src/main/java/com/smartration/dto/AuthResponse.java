package com.smartration.dto;

import com.smartration.entity.enums.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private Long shopId;
    private String shopName;
    private Long rationCardId;
    private String cardNumber;
    private Boolean isTemporaryPassword;
}
