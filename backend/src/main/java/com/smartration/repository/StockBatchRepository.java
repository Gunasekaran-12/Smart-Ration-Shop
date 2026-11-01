package com.smartration.repository;

import com.smartration.entity.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StockBatchRepository extends JpaRepository<StockBatch, Long> {
    List<StockBatch> findByShopIdAndCommodityId(Long shopId, Long commodityId);

    List<StockBatch> findByShopIdAndCommodityIdAndAvailableQuantityGreaterThanOrderByReceivedDateAsc(
            Long shopId, Long commodityId, BigDecimal minQty);

    List<StockBatch> findByShopIdOrderByReceivedDateDesc(Long shopId);

    @Query("SELECT COALESCE(SUM(b.availableQuantity), 0) FROM StockBatch b WHERE b.shop.id = :shopId AND b.commodity.id = :commodityId")
    BigDecimal getTotalAvailableStock(@Param("shopId") Long shopId, @Param("commodityId") Long commodityId);

    @Query("SELECT COALESCE(SUM(b.initialQuantity), 0) FROM StockBatch b WHERE b.shop.id = :shopId AND b.commodity.id = :commodityId")
    BigDecimal getTotalInitialStock(@Param("shopId") Long shopId, @Param("commodityId") Long commodityId);
}
