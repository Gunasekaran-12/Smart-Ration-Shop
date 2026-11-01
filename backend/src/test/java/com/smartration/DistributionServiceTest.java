package com.smartration;

import com.smartration.dto.DistributionItemRequest;
import com.smartration.dto.DistributionRequest;
import com.smartration.entity.*;
import com.smartration.entity.enums.CardCategory;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.EntitlementExceededException;
import com.smartration.exception.InsufficientStockException;
import com.smartration.repository.*;
import com.smartration.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DistributionServiceTest {

    @Mock
    private DistributionRepository distributionRepository;
    @Mock
    private DistributionItemRepository distributionItemRepository;
    @Mock
    private RationCardRepository rationCardRepository;
    @Mock
    private RationShopRepository shopRepository;
    @Mock
    private CommodityRepository commodityRepository;
    @Mock
    private StockBatchRepository stockBatchRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private MonthlyEntitlementRepository monthlyEntitlementRepository;
    @Mock
    private EntitlementService entitlementService;
    @Mock
    private StockService stockService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private SseService sseService;
    @Mock
    private AuthService authService;
    @Mock
    private RationBookingRepository rationBookingRepository;

    @InjectMocks
    private DistributionService distributionService;

    private RationShop shop;
    private RationCard card;
    private Commodity rice;
    private MonthlyEntitlement entitlement;

    @BeforeEach
    void setUp() {
        shop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Test Shop").build();
        card = RationCard.builder().id(10L).cardNumber("RC-001").shop(shop).cardCategory(CardCategory.BPL).isActive(true).build();
        rice = Commodity.builder().id(1L).code("RICE").name("Rice").measurementUnit("KG").subsidizedPrice(new BigDecimal("3.00")).build();
        entitlement = MonthlyEntitlement.builder()
                .id(100L)
                .rationCard(card)
                .commodity(rice)
                .entitlementMonth("2026-10")
                .totalEntitledQuantity(new BigDecimal("20.00"))
                .distributedQuantity(BigDecimal.ZERO)
                .remainingQuantity(new BigDecimal("20.00"))
                .build();
    }

    @Test
    @DisplayName("Distribution throws EntitlementExceededException when requested quantity exceeds remaining entitlement")
    void testEntitlementExceeded() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(commodityRepository.findById(1L)).thenReturn(Optional.of(rice));
        when(entitlementService.getCurrentEntitlementMonth()).thenReturn("2026-10");
        when(monthlyEntitlementRepository.findByRationCardIdAndCommodityIdAndEntitlementMonth(10L, 1L, "2026-10"))
                .thenReturn(Optional.of(entitlement));

        // Request 25kg when remaining is only 20kg
        DistributionRequest req = DistributionRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .items(List.of(DistributionItemRequest.builder().commodityId(1L).quantity(new BigDecimal("25.00")).build()))
                .build();

        assertThrows(EntitlementExceededException.class, () -> distributionService.processDistribution(req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Distribution throws InsufficientStockException when shop stock is lower than requested quantity")
    void testInsufficientStock() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(commodityRepository.findById(1L)).thenReturn(Optional.of(rice));
        when(entitlementService.getCurrentEntitlementMonth()).thenReturn("2026-10");
        when(monthlyEntitlementRepository.findByRationCardIdAndCommodityIdAndEntitlementMonth(10L, 1L, "2026-10"))
                .thenReturn(Optional.of(entitlement));

        // Only 5kg available in shop warehouse, but 10kg requested
        when(stockBatchRepository.getTotalAvailableStock(1L, 1L)).thenReturn(new BigDecimal("5.00"));

        DistributionRequest req = DistributionRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .items(List.of(DistributionItemRequest.builder().commodityId(1L).quantity(new BigDecimal("10.00")).build()))
                .build();

        assertThrows(InsufficientStockException.class, () -> distributionService.processDistribution(req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Distribution rejects transaction if Ration Card is inactive")
    void testInactiveRationCardRejected() {
        card.setIsActive(false);
        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));

        DistributionRequest req = DistributionRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .items(List.of(DistributionItemRequest.builder().commodityId(1L).quantity(new BigDecimal("5.00")).build()))
                .build();

        assertThrows(BadRequestException.class, () -> distributionService.processDistribution(req, "127.0.0.1"));
    }
}
