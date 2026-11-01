package com.smartration.service;

import com.smartration.dto.NotificationDto;
import com.smartration.entity.Notification;
import com.smartration.entity.enums.NotificationType;
import com.smartration.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseService sseService;

    @Transactional
    public NotificationDto createNotification(Long targetUserId, String targetRole, Long targetShopId,
                                             String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .targetUserId(targetUserId)
                .targetRole(targetRole)
                .targetShopId(targetShopId)
                .title(title)
                .message(message)
                .notificationType(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = mapToDto(saved);

        // Broadcast notification to live connected clients
        sseService.broadcastEvent("NOTIFICATION", dto);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(Long userId, String role, Long shopId) {
        return notificationRepository.findRelevantNotifications(userId, role, shopId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .targetUserId(n.getTargetUserId())
                .targetRole(n.getTargetRole())
                .targetShopId(n.getTargetShopId())
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
