package com.smartration.dto;

import com.smartration.entity.enums.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long targetUserId;
    private String targetRole;
    private Long targetShopId;
    private String title;
    private String message;
    private NotificationType notificationType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
