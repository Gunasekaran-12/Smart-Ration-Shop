package com.smartration.entity;

import com.smartration.entity.enums.CalculationType;
import com.smartration.entity.enums.CardCategory;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "entitlement_rules", uniqueConstraints = {
    @UniqueConstraint(name = "uk_rule_cat_comm", columnNames = {"card_category", "commodity_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntitlementRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_category", nullable = false, length = 20)
    private CardCategory cardCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_type", nullable = false, length = 30)
    private CalculationType calculationType;

    @Column(name = "base_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseQuantity;

    @Column(name = "max_quantity", precision = 10, scale = 2)
    private BigDecimal maxQuantity;

    @Column(name = "price_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
