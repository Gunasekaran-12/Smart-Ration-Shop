package com.smartration.repository;

import com.smartration.entity.DistributionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DistributionItemRepository extends JpaRepository<DistributionItem, Long> {
    List<DistributionItem> findByDistributionId(Long distributionId);

    @Query("SELECT COALESCE(SUM(di.quantity), 0) FROM DistributionItem di " +
           "WHERE di.distribution.shop.id = :shopId AND di.commodity.id = :commodityId " +
           "AND di.distribution.distributionDate >= :startDate AND di.distribution.distributionDate <= :endDate")
    BigDecimal sumQuantityByCommodityAndPeriod(@Param("shopId") Long shopId,
                                               @Param("commodityId") Long commodityId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
}
