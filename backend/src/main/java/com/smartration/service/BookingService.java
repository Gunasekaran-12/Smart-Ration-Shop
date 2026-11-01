package com.smartration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartration.dto.BookingRequest;
import com.smartration.dto.BookingResponse;
import com.smartration.dto.DistributionItemRequest;
import com.smartration.dto.SlotAvailabilityDto;
import com.smartration.entity.*;
import com.smartration.entity.enums.NotificationType;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.InsufficientStockException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingSlotRepository slotRepository;
    private final RationBookingRepository bookingRepository;
    private final RationCardRepository rationCardRepository;
    private final RationShopRepository shopRepository;
    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<SlotAvailabilityDto> getAvailableSlots(Long shopId, LocalDate date) {
        RationShop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found: " + shopId));

        List<BookingSlot> slots = slotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(shopId, date);

        // If no slots configured for today/date, auto-seed standard 30-minute intervals
        if (slots.isEmpty()) {
            slots = generateDefaultDailySlots(shop, date);
            slotRepository.saveAll(slots);
        }

        return slots.stream().map(s -> {
            int remaining = Math.max(0, s.getMaxCapacity() - s.getBookedCount());
            return SlotAvailabilityDto.builder()
                    .slotId(s.getId())
                    .shopId(shop.getId())
                    .shopName(shop.getShopName())
                    .slotDate(s.getSlotDate())
                    .startTime(s.getStartTime())
                    .endTime(s.getEndTime())
                    .maxCapacity(s.getMaxCapacity())
                    .bookedCount(s.getBookedCount())
                    .remainingCapacity(remaining)
                    .isAvailable(remaining > 0 && Boolean.TRUE.equals(s.getIsActive()))
                    .isActive(s.getIsActive())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String ipAddress) {
        User user = authService.getCurrentAuthenticatedUser();
        if (user == null) {
            throw new BadRequestException("Authentication required to reserve slot");
        }

        LocalDate bookingDate = request.getEffectiveBookingDate();
        if (bookingDate == null) {
            throw new BadRequestException("Booking date is required");
        }

        RationCard card = rationCardRepository.findById(request.getRationCardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ration Card not found: " + request.getRationCardId()));

        // Enforce beneficiary ownership check
        if (user.getRole() == Role.BENEFICIARY && user.getRationCardId() != null) {
            if (!user.getRationCardId().equals(card.getId())) {
                throw new BadRequestException("Unauthorized: Beneficiaries can only book slots for their own enrolled ration card");
            }
        }

        if (!Boolean.TRUE.equals(card.getIsActive())) {
            throw new BadRequestException("Cannot book slots for an inactive or suspended ration card");
        }

        // Prevent duplicate bookings on the same date
        boolean hasExisting = bookingRepository.existsByRationCardIdAndBookingDateAndStatus(
                card.getId(), bookingDate, "CONFIRMED"
        );
        if (hasExisting) {
            throw new BadRequestException("You already have a confirmed slot booking on " + bookingDate + ". Please attend or cancel existing booking first.");
        }

        BookingSlot slot;
        if (request.getSlotId() != null) {
            slot = slotRepository.findByIdWithLock(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking slot not found: " + request.getSlotId()));
        } else if (request.getSlotTime() != null) {
            LocalTime start = LocalTime.parse(request.getSlotTime().split("-")[0].trim());
            slot = slotRepository.findByShopIdAndSlotDateAndStartTime(request.getShopId(), bookingDate, start)
                    .flatMap(s -> slotRepository.findByIdWithLock(s.getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Booking slot not found for time: " + request.getSlotTime()));
        } else {
            throw new BadRequestException("Slot ID is required");
        }

        if (!Boolean.TRUE.equals(slot.getIsActive())) {
            throw new BadRequestException("The selected 30-minute distribution slot is currently inactive");
        }

        if (slot.getBookedCount() >= slot.getMaxCapacity()) {
            throw new BadRequestException("Selected slot capacity (maximum " + slot.getMaxCapacity() + " beneficiaries) has been fully booked. Please choose another 30-minute slot.");
        }

        // Verify physical stock availability before allowing reservation
        String reservedCommoditiesJson = null;
        if (request.getRequestedItems() != null && !request.getRequestedItems().isEmpty()) {
            for (DistributionItemRequest item : request.getRequestedItems()) {
                Commodity comm = commodityRepository.findById(item.getCommodityId())
                        .orElseThrow(() -> new ResourceNotFoundException("Commodity not found: " + item.getCommodityId()));

                BigDecimal availableStock = stockBatchRepository.findByShopIdAndCommodityId(request.getShopId(), comm.getId())
                        .stream()
                        .map(StockBatch::getAvailableQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (availableStock.compareTo(item.getQuantity()) < 0) {
                    throw new InsufficientStockException("Cannot reserve booking: Insufficient stock at Fair Price Shop for "
                            + comm.getName() + " (Available: " + availableStock + " " + comm.getMeasurementUnit()
                            + ", Required: " + item.getQuantity() + " " + comm.getMeasurementUnit() + ")");
                }
            }

            try {
                reservedCommoditiesJson = objectMapper.writeValueAsString(request.getRequestedItems());
            } catch (Exception e) {
                reservedCommoditiesJson = "[]";
            }
        }

        // Atomically increment slot booked count under pessimistic lock
        slot.setBookedCount(slot.getBookedCount() + 1);
        slotRepository.save(slot);

        String reference = "BK-" + bookingDate.toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        RationBooking booking = RationBooking.builder()
                .bookingReference(reference)
                .rationCard(card)
                .beneficiaryUser(user)
                .shop(slot.getShop())
                .slot(slot)
                .bookingDate(bookingDate)
                .status("CONFIRMED")
                .reservedCommoditiesJson(reservedCommoditiesJson)
                .build();

        RationBooking saved = bookingRepository.save(booking);

        // Persistent notification
        notificationService.createNotification(
                user.getId(),
                user.getRole().name(),
                slot.getShop().getId(),
                "Token Booking Confirmed: " + reference,
                "Your ration collection slot on " + bookingDate + " between "
                        + slot.getStartTime() + " and " + slot.getEndTime() + " is confirmed. Please bring your Ration Card.",
                NotificationType.BOOKING_CONFIRMATION
        );

        auditLogService.logAction(user, "CREATE_RATION_BOOKING", "RATION_BOOKING",
                saved.getId().toString(), slot.getShop().getId(),
                "Confirmed booking " + reference + " for slot " + slot.getStartTime() + "-" + slot.getEndTime(), ipAddress);

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String reason, String ipAddress) {
        User user = authService.getCurrentAuthenticatedUser();
        RationBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new BadRequestException("Only CONFIRMED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        if (user != null && user.getRole() == Role.BENEFICIARY && user.getRationCardId() != null) {
            if (!user.getRationCardId().equals(booking.getRationCard().getId())) {
                throw new BadRequestException("Unauthorized: Cannot cancel another cardholder's booking");
            }
        }

        // Atomically release slot capacity with lock
        BookingSlot slot = slotRepository.findByIdWithLock(booking.getSlot().getId())
                .orElse(booking.getSlot());
        if (slot.getBookedCount() > 0) {
            slot.setBookedCount(slot.getBookedCount() - 1);
            slotRepository.save(slot);
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(reason != null ? reason.trim() : "Cancelled by cardholder request");
        RationBooking updated = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getBeneficiaryUser().getId(),
                "BENEFICIARY",
                booking.getShop().getId(),
                "Booking Cancelled: " + booking.getBookingReference(),
                "Your ration slot for " + booking.getBookingDate() + " was cancelled. Slot capacity and quotas have been released.",
                NotificationType.BOOKING_CANCELLATION
        );

        auditLogService.logAction(user, "CANCEL_RATION_BOOKING", "RATION_BOOKING",
                updated.getId().toString(), booking.getShop().getId(),
                "Cancelled booking " + booking.getBookingReference() + ". Reason: " + booking.getCancellationReason(), ipAddress);

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user == null || user.getRationCardId() == null) {
            return Collections.emptyList();
        }
        return bookingRepository.findByRationCardIdOrderByBookingDateDesc(user.getRationCardId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getShopBookings(Long shopId, LocalDate date) {
        if (date != null) {
            return bookingRepository.findByShopIdAndBookingDateOrderByCreatedAtDesc(shopId, date)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        }
        return bookingRepository.findByShopIdOrderByBookingDateDesc(shopId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<BookingSlot> generateDefaultDailySlots(RationShop shop, LocalDate date) {
        List<BookingSlot> slots = new ArrayList<>();
        LocalTime[][] times = {
                {LocalTime.of(9, 0), LocalTime.of(9, 30)},
                {LocalTime.of(9, 30), LocalTime.of(10, 0)},
                {LocalTime.of(10, 0), LocalTime.of(10, 30)},
                {LocalTime.of(10, 30), LocalTime.of(11, 0)},
                {LocalTime.of(11, 0), LocalTime.of(11, 30)},
                {LocalTime.of(11, 30), LocalTime.of(12, 0)},
                {LocalTime.of(14, 0), LocalTime.of(14, 30)},
                {LocalTime.of(14, 30), LocalTime.of(15, 0)},
                {LocalTime.of(15, 0), LocalTime.of(15, 30)},
                {LocalTime.of(15, 30), LocalTime.of(16, 0)},
                {LocalTime.of(16, 0), LocalTime.of(16, 30)},
                {LocalTime.of(16, 30), LocalTime.of(17, 0)}
        };

        for (LocalTime[] slotTime : times) {
            slots.add(BookingSlot.builder()
                    .shop(shop)
                    .slotDate(date)
                    .startTime(slotTime[0])
                    .endTime(slotTime[1])
                    .maxCapacity(20)
                    .bookedCount(0)
                    .isActive(true)
                    .build());
        }
        return slots;
    }

    private BookingResponse mapToResponse(RationBooking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .rationCardId(b.getRationCard().getId())
                .cardNumber(b.getRationCard().getCardNumber())
                .headOfFamily(b.getRationCard().getHeadOfFamily())
                .shopId(b.getShop().getId())
                .shopName(b.getShop().getShopName())
                .slotId(b.getSlot().getId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getSlot().getStartTime())
                .endTime(b.getSlot().getEndTime())
                .status(b.getStatus())
                .cancellationReason(b.getCancellationReason())
                .reservedCommoditiesJson(b.getReservedCommoditiesJson())
                .distributionId(b.getDistribution() != null ? b.getDistribution().getId() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
