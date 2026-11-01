package com.smartration;

import com.smartration.entity.Commodity;
import com.smartration.entity.EntitlementRule;
import com.smartration.entity.enums.CalculationType;
import com.smartration.entity.enums.CardCategory;
import com.smartration.service.EntitlementService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class EntitlementServiceTest {

    @InjectMocks
    private EntitlementService entitlementService;

    @Test
    @DisplayName("Fixed per card calculation returns exact base quantity regardless of family size")
    void testFixedPerCardCalculation() {
        EntitlementRule rule = EntitlementRule.builder()
                .cardCategory(CardCategory.AAY)
                .calculationType(CalculationType.FIXED_PER_CARD)
                .baseQuantity(new BigDecimal("35.00"))
                .pricePerUnit(new BigDecimal("1.00"))
                .effectiveFrom(LocalDate.now())
                .build();

        BigDecimal qtyFor3Members = entitlementService.calculateEntitledQuantity(rule, 3);
        BigDecimal qtyFor8Members = entitlementService.calculateEntitledQuantity(rule, 8);

        assertEquals(new BigDecimal("35.00"), qtyFor3Members);
        assertEquals(new BigDecimal("35.00"), qtyFor8Members);
    }

    @Test
    @DisplayName("Per member calculation scales with family members and respects max cap")
    void testPerMemberCalculationWithCap() {
        EntitlementRule rule = EntitlementRule.builder()
                .cardCategory(CardCategory.BPL)
                .calculationType(CalculationType.PER_MEMBER)
                .baseQuantity(new BigDecimal("5.00"))
                .maxQuantity(new BigDecimal("25.00"))
                .pricePerUnit(new BigDecimal("3.00"))
                .effectiveFrom(LocalDate.now())
                .build();

        // 4 members * 5kg = 20kg (< max 25kg)
        BigDecimal qtyFor4Members = entitlementService.calculateEntitledQuantity(rule, 4);
        assertEquals(new BigDecimal("20.00"), qtyFor4Members);

        // 7 members * 5kg = 35kg -> capped at max 25kg
        BigDecimal qtyFor7Members = entitlementService.calculateEntitledQuantity(rule, 7);
        assertEquals(new BigDecimal("25.00"), qtyFor7Members);
    }
}
