package com.smartration.repository;

import com.smartration.entity.BookingSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingSlotRepository extends JpaRepository<BookingSlot, Long> {
    List<BookingSlot> findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(Long shopId, LocalDate slotDate);
    List<BookingSlot> findByShopIdAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(Long shopId);
    Optional<BookingSlot> findByShopIdAndSlotDateAndStartTime(Long shopId, LocalDate slotDate, LocalTime startTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM BookingSlot s WHERE s.id = :id")
    Optional<BookingSlot> findByIdWithLock(@Param("id") Long id);
}
