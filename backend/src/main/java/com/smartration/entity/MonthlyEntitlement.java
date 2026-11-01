package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_entitlements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_card_comm_month", columnNames = {"ration_card_id", "commodity_id", "entitlement_month"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyEntitlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ration_card_id", nullable = false)
    private RationCard rationCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Column(name = "entitlement_month", nullable = false, length = 7) // 'YYYY-MM'
    private String entitlementMonth;

    @Column(name = "total_entitled_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalEntitledQuantity;

    @Column(name = "distributed_quantity", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal distributedQuantity = BigDecimal.ZERO;

    @Column(name = "remaining_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal remainingQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private EntitlementRule rule;

    @Column(name = "last_distributed_at")
    private LocalDateTime lastDistributedAt;

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
