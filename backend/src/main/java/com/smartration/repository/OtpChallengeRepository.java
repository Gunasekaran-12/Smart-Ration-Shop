package com.smartration.repository;

import com.smartration.entity.OtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, Long> {
    Optional<OtpChallenge> findByTransactionRef(String transactionRef);
    Optional<OtpChallenge> findTopByRationCardIdAndIsConsumedFalseOrderByCreatedAtDesc(Long rationCardId);
}

