package com.smartration.repository;

import com.smartration.entity.Commodity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommodityRepository extends JpaRepository<Commodity, Long> {
    Optional<Commodity> findByCode(String code);
    boolean existsByCode(String code);
    List<Commodity> findByIsActiveTrue();
    List<Commodity> findByIsActiveTrueOrderByNameAsc();
}
