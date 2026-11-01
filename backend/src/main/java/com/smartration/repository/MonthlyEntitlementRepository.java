package com.smartration.repository;

import com.smartration.entity.MonthlyEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyEntitlementRepository extends JpaRepository<MonthlyEntitlement, Long> {
    List<MonthlyEntitlement> findByRationCardIdAndEntitlementMonth(Long rationCardId, String entitlementMonth);

    Optional<MonthlyEntitlement> findByRationCardIdAndCommodityIdAndEntitlementMonth(
            Long rationCardId, Long commodityId, String entitlementMonth);

    List<MonthlyEntitlement> findByRationCardId(Long rationCardId);
}
