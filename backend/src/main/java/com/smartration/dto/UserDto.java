package com.smartration.dto;

import com.smartration.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;

    @NotBlank(message = "Username is required")
    private String username;

    private String password; // Nullable when updating

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String email;
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    private Long shopId;
    private String shopName;
    private Long rationCardId;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
