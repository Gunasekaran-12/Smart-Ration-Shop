package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_ref", nullable = false, unique = true, length = 60)
    private String transactionRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ration_card_id", nullable = false)
    private RationCard rationCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 3;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_consumed", nullable = false)
    @Builder.Default
    private Boolean isConsumed = false;

    @Column(name = "requested_items_json", columnDefinition = "TEXT")
    private String requestedItemsJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

