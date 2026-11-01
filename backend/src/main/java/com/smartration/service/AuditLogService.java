package com.smartration.service;

import com.smartration.dto.AuditLogDto;
import com.smartration.entity.AuditLog;
import com.smartration.entity.User;
import com.smartration.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(User user, String action, String entityType, String entityId, Long shopId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(user != null ? user.getId() : 0L)
                    .username(user != null ? user.getUsername() : "SYSTEM")
                    .userRole(user != null && user.getRole() != null ? user.getRole().name() : "SYSTEM")
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .shopId(shopId)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit logged: user={}, action={}, entity={}/{}", auditLog.getUsername(), action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(Long shopId, String action, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.filterAuditLogs(shopId, action, startDate, endDate, pageable);
        return page.map(this::mapToDto);
    }

    private AuditLogDto mapToDto(AuditLog a) {
        return AuditLogDto.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .username(a.getUsername())
                .userRole(a.getUserRole())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .shopId(a.getShopId())
                .details(a.getDetails())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
