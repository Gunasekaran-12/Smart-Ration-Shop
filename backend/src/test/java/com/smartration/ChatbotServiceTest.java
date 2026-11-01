package com.smartration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartration.dto.ChatMessageRequest;
import com.smartration.dto.ChatMessageResponse;
import com.smartration.dto.ChatTurnDto;
import com.smartration.entity.*;
import com.smartration.entity.enums.Role;
import com.smartration.repository.*;
import com.smartration.service.AuthService;
import com.smartration.service.ChatbotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatbotServiceTest {

    @Mock
    private CommodityRepository commodityRepository;

    @Mock
    private StockBatchRepository stockBatchRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private RationShopRepository shopRepository;

    @Mock
    private BookingSlotRepository bookingSlotRepository;

    @Mock
    private RationBookingRepository bookingRepository;

    @Mock
    private MonthlyEntitlementRepository monthlyEntitlementRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private EntitlementRuleRepository entitlementRuleRepository;

    @Mock
    private RationCardRepository rationCardRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private DistributionRepository distributionRepository;

    @Mock
    private TransactionConflictRepository conflictRepository;

    @Mock
    private AuthService authService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ChatbotService chatbotService;

    private RationShop demoShop;
    private Commodity rice;
    private Commodity sugar;
    private Commodity wheat;
    private Commodity oil;
    private Commodity uradDal;

    @BeforeEach
    void setUp() {
        demoShop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Central Fair Price Shop").isOpen(true).operatingHours("09:00 AM - 05:30 PM").build();
        rice = Commodity.builder().id(1L).code("RICE").name("Boiled Rice (Grade A)").measurementUnit("KG").subsidizedPrice(new BigDecimal("3.00")).lowStockThreshold(new BigDecimal("200.00")).isActive(true).build();
        sugar = Commodity.builder().id(3L).code("SUGAR").name("Refined Cane Sugar").measurementUnit("KG").subsidizedPrice(new BigDecimal("13.50")).lowStockThreshold(new BigDecimal("50.00")).isActive(true).build();
        wheat = Commodity.builder().id(2L).code("WHEAT").name("Whole Milling Wheat").measurementUnit("KG").subsidizedPrice(new BigDecimal("2.00")).lowStockThreshold(new BigDecimal("150.00")).isActive(true).build();
        oil = Commodity.builder().id(6L).code("OIL").name("Cooking Oil").measurementUnit("LITRE").subsidizedPrice(new BigDecimal("25.00")).lowStockThreshold(new BigDecimal("50.00")).isActive(true).build();
        uradDal = Commodity.builder().id(7L).code("URAD_DAL").name("Urad Dal (Split Black Gram)").measurementUnit("KG").subsidizedPrice(new BigDecimal("30.00")).lowStockThreshold(new BigDecimal("50.00")).isActive(true).build();
    }

    @Test
    void testChatbotInventoryRiceStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("How much rice is available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_RICE", response.getIntentDetected());
        assertTrue(response.getReply().contains("950.00 KG"));
        assertTrue(response.getReply().contains("Physical Stock at Counter:"));
        assertTrue(response.getReply().contains("In stock"));
        assertTrue(response.isInformationalOnly());
    }

    @Test
    void testChatbotSugarOutOfStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(BigDecimal.ZERO).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Is sugar available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_SUGAR", response.getIntentDetected());
        assertTrue(response.getReply().contains("OUT OF STOCK"));
        assertTrue(response.getReply().contains("2026-11-02"));
    }

    @Test
    void testChatbotContextualFollowUpResolution() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        // Previous turn was about rice
        ChatTurnDto turn1User = ChatTurnDto.builder().role("user").content("How much rice is available?").build();
        ChatTurnDto turn1Bot = ChatTurnDto.builder().role("assistant").content("Boiled Rice is in stock: 950.00 KG").build();

        // User asks a follow up using "it"
        ChatMessageRequest followUpRequest = ChatMessageRequest.builder()
                .message("Can I book a slot for it?")
                .shopId(1L)
                .history(List.of(turn1User, turn1Bot))
                .build();

        ChatMessageResponse response = chatbotService.processMessage(followUpRequest);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_RICE", response.getIntentDetected());
        assertEquals("RICE", response.getResolvedEntity());
        assertTrue(response.getReply().contains("Boiled Rice"));
    }

    @Test
    void testSlotVsStockDiscrepancyExplanation() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(BigDecimal.ZERO).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Why is a slot available but sugar is unavailable?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("SLOT_VS_STOCK_DISCREPANCY", response.getIntentDetected());
        assertTrue(response.getReply().contains("independent constraints"));
        assertTrue(response.getReply().contains("Refined Cane Sugar"));
    }

    @Test
    void testNowVsLaterCommoditiesReport() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(rice, sugar));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(BigDecimal.ZERO).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Which commodities can I obtain now versus later?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("OBTAIN_NOW_VS_LATER", response.getIntentDetected());
        assertTrue(response.getReply().contains("Available Now for Collection:"));
        assertTrue(response.getReply().contains("Available Later (Awaiting Inward Consignment):"));
        assertTrue(response.getReply().contains("Refined Cane Sugar"));
    }

    @Test
    void testChatbotLowStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(oil));
        when(commodityRepository.findByCode("OIL")).thenReturn(Optional.of(oil));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 6L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("25.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Which commodities have low stock?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("LOW_STOCK_INVENTORY", response.getIntentDetected());
        assertTrue(response.getReply().contains("Cooking Oil"));
        assertTrue(response.getReply().contains("25.00 LITRE"));
    }

    @Test
    void testChatbotAllCommoditiesFullTableQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(rice, sugar));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(BigDecimal.ZERO).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Show stock table for all commodities")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("ALL_COMMODITIES_AVAILABLE", response.getIntentDetected());
        assertTrue(response.getReply().contains("| Commodity | Physical | Reserved | Available | Status | Price |"));
        assertTrue(response.getReply().contains("Boiled Rice (Grade A)"));
        assertTrue(response.getReply().contains("Refined Cane Sugar"));
    }

    @Test
    void testChatbotDistributionScheduleQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What are this month's distribution dates?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("DISTRIBUTION_SCHEDULE", response.getIntentDetected());
        assertTrue(response.getReply().contains("Week 1 (1st - 7th)"));
        assertTrue(response.getReply().contains("Week 4"));
    }

    @Test
    void testChatbotBookingCapacityGuidance() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(bookingSlotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(eq(1L), any(LocalDate.class)))
                .thenReturn(List.of(
                        BookingSlot.builder().maxCapacity(20).bookedCount(8).build()
                ));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(sugar));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(BigDecimal.ZERO).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Can I book a ration slot now?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("SLOT_BOOKING_GUIDANCE", response.getIntentDetected());
        assertTrue(response.getReply().contains("30-minute") || response.getReply().contains("30-Minute"));
        assertTrue(response.getReply().contains("12 places remaining"));
    }

    @Test
    void testBeneficiaryUnauthenticatedPrivacyNotice() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(authService.getCurrentAuthenticatedUser()).thenReturn(null);

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What is my quota?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("BENEFICIARY_PERSONAL_RECORDS", response.getIntentDetected());
        assertTrue(response.getReply().contains("Privacy Notice") || response.getReply().contains("protected"));
    }

    @Test
    void testAuditorSummaryInquiry() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        User auditor = User.builder().id(4L).role(Role.AUDITOR).build();
        when(authService.getCurrentAuthenticatedUser()).thenReturn(auditor);
        when(conflictRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What is the audit and compliance status?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("AUDITOR_COMPLIANCE_SUMMARY", response.getIntentDetected());
        assertTrue(response.getReply().contains("Quality Audit & Compliance Summary"));
        assertTrue(response.getReply().contains("Electronic Scale Telemetry"));
    }

    @Test
    void testChatbotQuantityQueryAvailable() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("I need 5 kg of rice. Is it available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_QUANTITY_CHECK_RICE", response.getIntentDetected());
        assertTrue(response.getReply().contains("fully AVAILABLE"));
        assertTrue(response.getReply().contains("950.00 KG"));
    }

    @Test
    void testChatbotQuantityQueryInsufficient() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Can I get 2000 kg of rice?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_QUANTITY_CHECK_RICE", response.getIntentDetected());
        assertTrue(response.getReply().contains("Partial Availability"));
        assertTrue(response.getReply().contains("requested 2000"));
    }

    @Test
    void testChatbotStockAddedToday() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(stockMovementRepository.sumInwardQuantityByPeriod(eq(1L), any(), any()))
                .thenReturn(new BigDecimal("1200.00"));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("How much stock was added today?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("STOCK_ADDED_TODAY", response.getIntentDetected());
        assertTrue(response.getReply().contains("1200.00 units"));
    }

    @Test
    void testChatbotStockDistributedToday() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(stockMovementRepository.sumDistributedQuantityByPeriod(eq(1L), any(), any()))
                .thenReturn(new BigDecimal("350.50"));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("How much stock was distributed today?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("STOCK_DISTRIBUTED_TODAY", response.getIntentDetected());
        assertTrue(response.getReply().contains("350.50 units"));
    }

    @Test
    void testChatbotUradDalStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("URAD_DAL")).thenReturn(Optional.of(uradDal));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 7L)).thenReturn(List.of(
                StockBatch.builder().availableQuantity(new BigDecimal("150.00")).build()
        ));
        when(bookingRepository.findByShopIdOrderByBookingDateDesc(1L)).thenReturn(Collections.emptyList());

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Is urad dal available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_URAD_DAL", response.getIntentDetected());
        assertTrue(response.getReply().contains("Urad Dal (Split Black Gram)"));
        assertTrue(response.getReply().contains("150.00 KG"));
    }
}
