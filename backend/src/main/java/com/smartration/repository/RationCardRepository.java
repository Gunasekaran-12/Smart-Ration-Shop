package com.smartration.repository;

import com.smartration.entity.RationCard;
import com.smartration.entity.enums.CardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RationCardRepository extends JpaRepository<RationCard, Long> {
    Optional<RationCard> findByCardNumber(String cardNumber);
    Optional<RationCard> findByCardNumberIgnoreCase(String cardNumber);
    boolean existsByCardNumber(String cardNumber);
    List<RationCard> findByShopId(Long shopId);

    @Query("SELECT rc FROM RationCard rc WHERE " +
           "(:shopId IS NULL OR rc.shop.id = :shopId) AND " +
           "(:category IS NULL OR rc.cardCategory = :category) AND " +
           "(:query IS NULL OR LOWER(rc.cardNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(rc.headOfFamily) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<RationCard> searchCards(@Param("shopId") Long shopId,
                                 @Param("category") CardCategory category,
                                 @Param("query") String query,
                                 Pageable pageable);
}
