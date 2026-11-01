package com.smartration.repository;

import com.smartration.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE " +
           "(n.targetUserId = :userId) OR " +
           "(n.targetRole = :role) OR " +
           "(n.targetShopId = :shopId) OR " +
           "(n.targetUserId IS NULL AND n.targetRole IS NULL AND n.targetShopId IS NULL) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findRelevantNotifications(@Param("userId") Long userId,
                                                 @Param("role") String role,
                                                 @Param("shopId") Long shopId);

    long countByTargetUserIdAndIsReadFalse(Long targetUserId);
}
