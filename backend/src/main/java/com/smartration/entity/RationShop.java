package com.smartration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ration_shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RationShop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_number", nullable = false, unique = true, length = 50)
    private String shopNumber;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String shopName;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(name = "taluk_block", nullable = false, length = 100)
    private String talukBlock;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_open", nullable = false)
    @Builder.Default
    private Boolean isOpen = true;

    @Column(name = "last_opened_at")
    private LocalDateTime lastOpenedAt;

    @Column(name = "last_closed_at")
    private LocalDateTime lastClosedAt;

    @Column(name = "operating_hours", length = 100)
    @Builder.Default
    private String operatingHours = "09:00 AM - 01:00 PM, 02:00 PM - 06:00 PM";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.lastOpenedAt == null) {
            this.lastOpenedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
