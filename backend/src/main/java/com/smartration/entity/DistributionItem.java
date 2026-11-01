package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "distribution_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distribution_id", nullable = false)
    private Distribution distribution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commodity_id", nullable = false)
    private Commodity commodity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_batch_id")
    private StockBatch stockBatch;
}
