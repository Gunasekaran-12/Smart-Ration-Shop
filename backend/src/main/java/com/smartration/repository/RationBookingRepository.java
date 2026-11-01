package com.smartration.repository;

import com.smartration.entity.RationBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RationBookingRepository extends JpaRepository<RationBooking, Long> {
    Optional<RationBooking> findByBookingReference(String bookingReference);
    List<RationBooking> findByRationCardIdOrderByBookingDateDesc(Long rationCardId);
    List<RationBooking> findByBeneficiaryUserIdOrderByBookingDateDesc(Long userId);
    List<RationBooking> findByShopIdAndBookingDateOrderByCreatedAtDesc(Long shopId, LocalDate bookingDate);
    List<RationBooking> findByShopIdOrderByBookingDateDesc(Long shopId);
    boolean existsByRationCardIdAndBookingDateAndStatus(Long rationCardId, LocalDate bookingDate, String status);
}

