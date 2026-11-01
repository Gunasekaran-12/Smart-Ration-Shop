package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "distributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Distribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 60)
    private String transactionReference;

    @Column(name = "idempotency_key", unique = true, length = 100)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ration_card_id", nullable = false)
    private RationCard rationCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distributed_by_user_id", nullable = false)
    private User distributedByUser;

    @Column(name = "distribution_date", nullable = false)
    private LocalDateTime distributionDate;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "lifecycle_state", nullable = false, length = 40)
    @Builder.Default
    private String lifecycleState = "COMPLETED";

    @Column(name = "expected_stock_json", columnDefinition = "TEXT")
    private String expectedStockJson;

    @Column(name = "actual_stock_json", columnDefinition = "TEXT")
    private String actualStockJson;

    @Column(name = "receipt_notes")
    private String receiptNotes;

    @OneToMany(mappedBy = "distribution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DistributionItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.distributionDate == null) {
            this.distributionDate = LocalDateTime.now();
        }
    }
}
