package com.smartration.repository;

import com.smartration.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByShopIdOrderByCreatedAtDesc(Long shopId);

    Page<StockMovement> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:shopId IS NULL OR sm.shop.id = :shopId) AND " +
           "(:commodityId IS NULL OR sm.commodity.id = :commodityId) AND " +
           "(:startDate IS NULL OR sm.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR sm.createdAt <= :endDate) " +
           "ORDER BY sm.createdAt DESC")
    List<StockMovement> filterMovements(@Param("shopId") Long shopId,
                                        @Param("commodityId") Long commodityId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(sm.quantity), 0) FROM StockMovement sm " +
           "WHERE sm.shop.id = :shopId AND sm.movementType = 'INWARD_RECEIPT' " +
           "AND sm.createdAt >= :startDate AND sm.createdAt <= :endDate")
    BigDecimal sumInwardQuantityByPeriod(@Param("shopId") Long shopId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(ABS(sm.quantity)), 0) FROM StockMovement sm " +
           "WHERE sm.shop.id = :shopId AND sm.movementType = 'DISTRIBUTION_OUTWARD' " +
           "AND sm.createdAt >= :startDate AND sm.createdAt <= :endDate")
    BigDecimal sumDistributedQuantityByPeriod(@Param("shopId") Long shopId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
}
