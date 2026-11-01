package com.smartration;

import com.smartration.dto.ConflictResolutionRequest;
import com.smartration.entity.*;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.repository.DistributionRepository;
import com.smartration.repository.TransactionConflictRepository;
import com.smartration.service.AuditLogService;
import com.smartration.service.AuthService;
import com.smartration.service.ReconciliationService;
import com.smartration.service.StockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReconciliationServiceTest {

    @Mock
    private TransactionConflictRepository conflictRepository;
    @Mock
    private DistributionRepository distributionRepository;
    @Mock
    private StockService stockService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private AuthService authService;

    @InjectMocks
    private ReconciliationService reconciliationService;

    private User operator;
    private User admin;
    private TransactionConflict conflict;
    private Distribution distribution;
    private RationShop shop;
    private Commodity commodity;

    @BeforeEach
    void setUp() {
        shop = RationShop.builder().id(1L).shopName("Shop 1").build();
        operator = User.builder().id(2L).username("operator_blr").role(Role.SHOP_OPERATOR).shop(shop).build();
        admin = User.builder().id(1L).username("admin").role(Role.SUPER_ADMIN).build();
        commodity = Commodity.builder().id(1L).code("RICE").name("Rice").build();
        distribution = Distribution.builder().id(100L).transactionReference("TXN-1").shop(shop).build();

        conflict = TransactionConflict.builder()
                .id(10L)
                .distribution(distribution)
                .shop(shop)
                .commodity(commodity)
                .conflictType("STOCK_MISMATCH")
                .expectedStock(new BigDecimal("100.00"))
                .actualStock(new BigDecimal("90.00"))
                .differenceQuantity(new BigDecimal("-10.00"))
                .status("RECONCILIATION_REQUIRED")
                .reportedByUser(operator)
                .build();
    }

    @Test
    @DisplayName("Self-approval by reporting operator is strictly rejected")
    void testSelfApprovalRejection() {
        when(conflictRepository.findById(10L)).thenReturn(Optional.of(conflict));
        // Current user is the operator who reported the conflict
        when(authService.getCurrentAuthenticatedUser()).thenReturn(operator);

        ConflictResolutionRequest req = ConflictResolutionRequest.builder()
                .action("RECONCILED")
                .approvedAdjustment(new BigDecimal("10.00"))
                .resolutionNotes("I verified my own physical scale")
                .build();

        assertThrows(BadRequestException.class, () -> reconciliationService.resolveConflict(10L, req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Admin authorization successfully reconciles conflict and updates status")
    void testAdminApprovalSuccess() {
        when(conflictRepository.findById(10L)).thenReturn(Optional.of(conflict));
        when(authService.getCurrentAuthenticatedUser()).thenReturn(admin);
        when(conflictRepository.save(any(TransactionConflict.class))).thenAnswer(i -> i.getArgument(0));

        ConflictResolutionRequest req = ConflictResolutionRequest.builder()
                .action("RECONCILED")
                .approvedAdjustment(new BigDecimal("10.00"))
                .resolutionNotes("Physical audit inspection verified discrepancy due to moisture loss")
                .build();

        TransactionConflict resolved = reconciliationService.resolveConflict(10L, req, "127.0.0.1");

        assertEquals("RECONCILED", resolved.getStatus());
        assertEquals("COMPLETED", distribution.getLifecycleState());
    }
}

