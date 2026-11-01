package com.smartration.service;

import com.smartration.dto.UserDto;
import com.smartration.entity.RationShop;
import com.smartration.entity.User;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.RationShopRepository;
import com.smartration.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RationShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(UserDto req, String ipAddress) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BadRequestException("Username already exists: " + req.getUsername());
        }

        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for new user creation");
        }

        RationShop shop = null;
        if (req.getShopId() != null) {
            shop = shopRepository.findById(req.getShopId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found: " + req.getShopId()));
        }

        User user = User.builder()
                .username(req.getUsername().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .email(req.getEmail())
                .phone(req.getPhone())
                .role(req.getRole())
                .shop(shop)
                .rationCardId(req.getRationCardId())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        User saved = userRepository.save(user);

        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "CREATE_USER", "USER",
                saved.getId().toString(), shop != null ? shop.getId() : null,
                "Created user " + saved.getUsername() + " with role " + saved.getRole(), ipAddress);

        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto req, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setFullName(req.getFullName().trim());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());

        if (req.getShopId() != null) {
            RationShop shop = shopRepository.findById(req.getShopId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found: " + req.getShopId()));
            user.setShop(shop);
        } else {
            user.setShop(null);
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        if (req.getIsActive() != null) {
            user.setIsActive(req.getIsActive());
        }

        User updated = userRepository.save(user);

        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "UPDATE_USER", "USER",
                updated.getId().toString(), updated.getShop() != null ? updated.getShop().getId() : null,
                "Updated user account " + updated.getUsername(), ipAddress);

        return mapToDto(updated);
    }

    private UserDto mapToDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole())
                .shopId(u.getShop() != null ? u.getShop().getId() : null)
                .shopName(u.getShop() != null ? u.getShop().getShopName() : null)
                .rationCardId(u.getRationCardId())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
