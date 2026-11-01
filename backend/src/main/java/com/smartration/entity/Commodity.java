package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "commodities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commodity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "measurement_unit", nullable = false, length = 20)
    private String measurementUnit; // KG, LITRE

    @Column(name = "subsidized_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subsidizedPrice = BigDecimal.ZERO;

    @Column(name = "low_stock_threshold", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lowStockThreshold = new BigDecimal("100.00");

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

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
