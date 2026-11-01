package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ration_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RationBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 60)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ration_card_id", nullable = false)
    private RationCard rationCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id", nullable = false)
    private User beneficiaryUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private BookingSlot slot;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED, COMPLETED, EXPIRED

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "reserved_commodities_json", columnDefinition = "TEXT")
    private String reservedCommoditiesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distribution_id")
    private Distribution distribution;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

