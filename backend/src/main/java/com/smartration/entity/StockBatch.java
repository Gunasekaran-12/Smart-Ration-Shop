package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Column(name = "batch_number", nullable = false, length = 60)
    private String batchNumber;

    @Column(name = "warehouse_ref", nullable = false, length = 100)
    private String warehouseRef;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "initial_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal initialQuantity;

    @Column(name = "available_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal availableQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
