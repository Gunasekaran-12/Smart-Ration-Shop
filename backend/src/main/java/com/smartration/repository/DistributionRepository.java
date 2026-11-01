package com.smartration.repository;

import com.smartration.entity.Distribution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DistributionRepository extends JpaRepository<Distribution, Long> {
    Optional<Distribution> findByTransactionReference(String transactionReference);
    Optional<Distribution> findByIdempotencyKey(String idempotencyKey);
    boolean existsByIdempotencyKey(String idempotencyKey);

    List<Distribution> findByRationCardIdOrderByDistributionDateDesc(Long rationCardId);

    Page<Distribution> findByShopIdOrderByDistributionDateDesc(Long shopId, Pageable pageable);

    @Query("SELECT d FROM Distribution d WHERE " +
           "(:shopId IS NULL OR d.shop.id = :shopId) AND " +
           "(:startDate IS NULL OR d.distributionDate >= :startDate) AND " +
           "(:endDate IS NULL OR d.distributionDate <= :endDate) " +
           "ORDER BY d.distributionDate DESC")
    List<Distribution> filterDistributions(@Param("shopId") Long shopId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(d) FROM Distribution d WHERE d.shop.id = :shopId AND d.distributionDate >= :startOfDay AND d.distributionDate <= :endOfDay")
    Long countTodayTransactions(@Param("shopId") Long shopId,
                                @Param("startOfDay") LocalDateTime startOfDay,
                                @Param("endOfDay") LocalDateTime endOfDay);
}
