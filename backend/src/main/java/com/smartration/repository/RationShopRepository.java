package com.smartration.repository;

import com.smartration.entity.RationShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RationShopRepository extends JpaRepository<RationShop, Long> {
    Optional<RationShop> findByShopNumber(String shopNumber);
    boolean existsByShopNumber(String shopNumber);
}
