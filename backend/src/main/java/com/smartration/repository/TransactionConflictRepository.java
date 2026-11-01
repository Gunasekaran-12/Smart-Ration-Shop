package com.smartration.repository;

import com.smartration.entity.TransactionConflict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionConflictRepository extends JpaRepository<TransactionConflict, Long> {
    List<TransactionConflict> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<TransactionConflict> findByStatusOrderByCreatedAtDesc(String status);
    List<TransactionConflict> findAllByOrderByCreatedAtDesc();
}

