package com.smartration.controller;

import com.smartration.dto.NotificationDto;
import com.smartration.entity.User;
import com.smartration.service.AuthService;
import com.smartration.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.ok(List.of());
        }

        Long shopId = currentUser.getShop() != null ? currentUser.getShop().getId() : null;
        return ResponseEntity.ok(notificationService.getNotificationsForUser(
                currentUser.getId(), currentUser.getRole().name(), shopId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
