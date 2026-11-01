package com.smartration.repository;

import com.smartration.entity.EntitlementRule;
import com.smartration.entity.enums.CardCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntitlementRuleRepository extends JpaRepository<EntitlementRule, Long> {
    List<EntitlementRule> findByCardCategoryAndIsActiveTrue(CardCategory cardCategory);
    Optional<EntitlementRule> findByCardCategoryAndCommodityIdAndIsActiveTrue(CardCategory cardCategory, Long commodityId);
    List<EntitlementRule> findByIsActiveTrue();
}
