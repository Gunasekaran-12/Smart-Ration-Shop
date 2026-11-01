package com.smartration.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String username;
    private String userRole;
    private String action;
    private String entityType;
    private String entityId;
    private Long shopId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
