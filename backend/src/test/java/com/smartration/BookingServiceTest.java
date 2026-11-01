package com.smartration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartration.dto.BookingRequest;
import com.smartration.dto.BookingResponse;
import com.smartration.entity.*;
import com.smartration.entity.enums.CardCategory;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.repository.*;
import com.smartration.service.AuditLogService;
import com.smartration.service.AuthService;
import com.smartration.service.BookingService;
import com.smartration.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingSlotRepository slotRepository;
    @Mock
    private RationBookingRepository bookingRepository;
    @Mock
    private RationCardRepository rationCardRepository;
    @Mock
    private RationShopRepository shopRepository;
    @Mock
    private CommodityRepository commodityRepository;
    @Mock
    private StockBatchRepository stockBatchRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private AuthService authService;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private BookingService bookingService;

    private User beneficiary;
    private RationShop shop;
    private RationCard card;
    private BookingSlot slot;

    @BeforeEach
    void setUp() {
        shop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Koramangala FPS").build();
        card = RationCard.builder().id(10L).cardNumber("RC-KA-01-987654").headOfFamily("Ramesh Kumar").shop(shop).cardCategory(CardCategory.BPL).isActive(true).build();
        beneficiary = User.builder().id(5L).username("beneficiary_demo").role(Role.BENEFICIARY).rationCardId(10L).shop(shop).build();
        slot = BookingSlot.builder().id(100L).shop(shop).slotDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(9, 30)).maxCapacity(20).bookedCount(0).isActive(true).build();
    }

    @Test
    @DisplayName("Throws exception when slot maximum capacity (20 beneficiaries) is reached")
    void testSlotMaxCapacityReached() {
        slot.setBookedCount(20); // Full capacity

        when(authService.getCurrentAuthenticatedUser()).thenReturn(beneficiary);
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(bookingRepository.existsByRationCardIdAndBookingDateAndStatus(10L, LocalDate.now(), "CONFIRMED")).thenReturn(false);
        when(slotRepository.findByIdWithLock(100L)).thenReturn(Optional.of(slot));

        BookingRequest req = BookingRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .slotId(100L)
                .bookingDate(LocalDate.now())
                .build();

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Throws exception when beneficiary tries to book duplicate slot on same date")
    void testDuplicateBookingOnSameDate() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(beneficiary);
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(bookingRepository.existsByRationCardIdAndBookingDateAndStatus(10L, LocalDate.now(), "CONFIRMED")).thenReturn(true);

        BookingRequest req = BookingRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .slotId(100L)
                .bookingDate(LocalDate.now())
                .build();

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(req, "127.0.0.1"));
    }

    @Test
    @DisplayName("Successful booking increments slot capacity atomically and generates reference")
    void testSuccessfulBooking() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(beneficiary);
        when(rationCardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(bookingRepository.existsByRationCardIdAndBookingDateAndStatus(10L, LocalDate.now(), "CONFIRMED")).thenReturn(false);
        when(slotRepository.findByIdWithLock(100L)).thenReturn(Optional.of(slot));
        when(bookingRepository.save(any(RationBooking.class))).thenAnswer(invocation -> {
            RationBooking b = invocation.getArgument(0);
            b.setId(500L);
            return b;
        });

        BookingRequest req = BookingRequest.builder()
                .rationCardId(10L)
                .shopId(1L)
                .slotId(100L)
                .bookingDate(LocalDate.now())
                .build();

        BookingResponse res = bookingService.createBooking(req, "127.0.0.1");

        assertNotNull(res);
        assertEquals("CONFIRMED", res.getStatus());
        assertTrue(res.getBookingReference().startsWith("BK-"));
        assertEquals(1, slot.getBookedCount());
    }

    @Test
    @DisplayName("Booking cancellation releases slot capacity exactly once")
    void testBookingCancellationReleasesCapacity() {
        slot.setBookedCount(1);
        RationBooking booking = RationBooking.builder()
                .id(500L)
                .bookingReference("BK-20261101-ABCD12")
                .rationCard(card)
                .beneficiaryUser(beneficiary)
                .shop(shop)
                .slot(slot)
                .bookingDate(LocalDate.now())
                .status("CONFIRMED")
                .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(beneficiary);
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(slotRepository.findByIdWithLock(100L)).thenReturn(Optional.of(slot));
        when(bookingRepository.save(any(RationBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse cancelled = bookingService.cancelBooking(500L, "Unable to attend", "127.0.0.1");

        assertNotNull(cancelled);
        assertEquals("CANCELLED", cancelled.getStatus());
        assertEquals(0, slot.getBookedCount());
    }
}

