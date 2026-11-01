package com.smartration.repository;

import com.smartration.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:shopId IS NULL OR a.shopId = :shopId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> filterAuditLogs(@Param("shopId") Long shopId,
                                   @Param("action") String action,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate,
                                   Pageable pageable);
}
