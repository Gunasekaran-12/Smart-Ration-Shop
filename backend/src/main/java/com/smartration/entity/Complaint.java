package com.smartration.entity;

import com.smartration.entity.enums.ComplaintCategory;
import com.smartration.entity.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_number", nullable = false, unique = true, length = 50)
    private String complaintNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ration_card_id", nullable = false)
    private RationCard rationCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id", nullable = false)
    private User beneficiaryUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private RationShop shop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ComplaintCategory category;

    @Column(nullable = false, length = 150)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(name = "resolution_remarks", columnDefinition = "TEXT")
    private String resolutionRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_user_id")
    private User resolvedByUser;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

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
