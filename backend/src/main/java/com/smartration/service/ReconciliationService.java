package com.smartration.service;

import com.smartration.dto.ConflictResolutionRequest;
import com.smartration.dto.ReconciliationRequest;
import com.smartration.dto.StockAdjustmentRequest;
import com.smartration.entity.*;
import com.smartration.entity.enums.Role;
import com.smartration.entity.enums.StockMovementType;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private final TransactionConflictRepository conflictRepository;
    private final DistributionRepository distributionRepository;
    private final CommodityRepository commodityRepository;
    private final RationShopRepository shopRepository;
    private final StockService stockService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    @Transactional
    public TransactionConflict raiseConflict(ReconciliationRequest request, String ipAddress) {
        User user = authService.getCurrentAuthenticatedUser();
        Distribution distribution = distributionRepository.findById(request.getDistributionId())
                .orElseThrow(() -> new ResourceNotFoundException("Distribution transaction not found: " + request.getDistributionId()));

        Commodity commodity = commodityRepository.findById(request.getCommodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity not found: " + request.getCommodityId()));

        BigDecimal difference = request.getActualStock().subtract(request.getExpectedStock());

        TransactionConflict conflict = TransactionConflict.builder()
                .distribution(distribution)
                .shop(distribution.getShop())
                .commodity(commodity)
                .conflictType(request.getConflictType())
                .expectedStock(request.getExpectedStock())
                .actualStock(request.getActualStock())
                .differenceQuantity(difference)
                .status("RECONCILIATION_REQUIRED")
                .reportedByUser(user)
                .resolutionNotes(request.getExplanation())
                .correctedQuantity(request.getProposedCorrection())
                .build();

        // Move distribution lifecycle state to CONFLICT
        distribution.setLifecycleState("CONFLICT_RECONCILIATION_REQUIRED");
        distributionRepository.save(distribution);

        TransactionConflict saved = conflictRepository.save(conflict);

        auditLogService.logAction(user, "RAISE_STOCK_CONFLICT", "TRANSACTION_CONFLICT",
                saved.getId().toString(), distribution.getShop().getId(),
                "Stock discrepancy detected (" + difference + " " + commodity.getMeasurementUnit() + ") on tx " + distribution.getTransactionReference(), ipAddress);

        return saved;
    }

    @Transactional
    public TransactionConflict resolveConflict(Long conflictId, ConflictResolutionRequest request, String ipAddress) {
        User user = authService.getCurrentAuthenticatedUser();
        TransactionConflict conflict = conflictRepository.findById(conflictId)
                .orElseThrow(() -> new ResourceNotFoundException("Conflict record not found: " + conflictId));

        if (!"RECONCILIATION_REQUIRED".equals(conflict.getStatus()) && !"CONFLICT_DETECTED".equals(conflict.getStatus())) {
            throw new BadRequestException("Conflict is already resolved or closed with status: " + conflict.getStatus());
        }

        // Strict Security Constraint: Shopkeeper Self-Approval Rejection
        if (conflict.getReportedByUser() != null && user != null && user.getId().equals(conflict.getReportedByUser().getId())) {
            if (user.getRole() != Role.SUPER_ADMIN) {
                throw new BadRequestException("Self-approval prohibited: Operators and Inspectors cannot approve their own raised stock corrections. Higher administrative authorization required.");
            }
        }

        if ("RECONCILED".equalsIgnoreCase(request.getAction())) {
            // Apply authorized stock adjustment correction
            BigDecimal adjustment = request.getApprovedAdjustment() != null
                    ? request.getApprovedAdjustment()
                    : conflict.getCorrectedQuantity();

            if (adjustment != null && adjustment.compareTo(BigDecimal.ZERO) != 0) {
                StockAdjustmentRequest adjReq = StockAdjustmentRequest.builder()
                        .shopId(conflict.getShop().getId())
                        .commodityId(conflict.getCommodity().getId())
                        .movementType(StockMovementType.ADJUSTMENT_CORRECTION)
                        .quantity(adjustment.abs())
                        .reason("Authorized Reconciliation: " + request.getResolutionNotes())
                        .build();

                stockService.recordStockAdjustment(adjReq, ipAddress);
            }

            conflict.setStatus("RECONCILED");
            conflict.setResolutionNotes(request.getResolutionNotes());
            conflict.setResolvedByUser(user);
            conflict.setResolvedAt(LocalDateTime.now());

            // Mark distribution lifecycle COMPLETED
            Distribution dist = conflict.getDistribution();
            dist.setLifecycleState("COMPLETED");
            distributionRepository.save(dist);

        } else if ("REJECTED".equalsIgnoreCase(request.getAction())) {
            conflict.setStatus("REJECTED");
            conflict.setResolutionNotes(request.getResolutionNotes());
            conflict.setResolvedByUser(user);
            conflict.setResolvedAt(LocalDateTime.now());

            Distribution dist = conflict.getDistribution();
            dist.setLifecycleState("CONFLICT_REJECTED");
            distributionRepository.save(dist);
        } else {
            throw new BadRequestException("Invalid resolution action: " + request.getAction() + ". Must be RECONCILED or REJECTED.");
        }

        TransactionConflict updated = conflictRepository.save(conflict);

        auditLogService.logAction(user, "RESOLVE_STOCK_CONFLICT", "TRANSACTION_CONFLICT",
                updated.getId().toString(), conflict.getShop().getId(),
                "Conflict resolution: " + updated.getStatus() + ". Notes: " + updated.getResolutionNotes(), ipAddress);

        return updated;
    }

    @Transactional(readOnly = true)
    public List<TransactionConflict> getAllConflicts(Long shopId) {
        if (shopId != null) {
            return conflictRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        }
        return conflictRepository.findAllByOrderByCreatedAtDesc();
    }
}
