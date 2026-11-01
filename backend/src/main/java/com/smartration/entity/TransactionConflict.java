package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_conflicts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionConflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distribution_id", nullable = false)
    private Distribution distribution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Column(name = "conflict_type", nullable = false, length = 50)
    private String conflictType;

    @Column(name = "expected_stock", nullable = false, precision = 12, scale = 2)
    private BigDecimal expectedStock;

    @Column(name = "actual_stock", nullable = false, precision = 12, scale = 2)
    private BigDecimal actualStock;

    @Column(name = "difference_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal differenceQuantity;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String status = "CONFLICT_DETECTED";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id", nullable = false)
    private User reportedByUser;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "corrected_quantity", precision = 12, scale = 2)
    private BigDecimal correctedQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_user_id")
    private User resolvedByUser;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

