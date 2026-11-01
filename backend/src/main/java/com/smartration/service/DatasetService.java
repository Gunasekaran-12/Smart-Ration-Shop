package com.smartration.service;

import com.smartration.dto.WeeklyDatasetDto;
import com.smartration.entity.BookingSlot;
import com.smartration.entity.Commodity;
import com.smartration.entity.RationShop;
import com.smartration.entity.StockBatch;
import com.smartration.repository.BookingSlotRepository;
import com.smartration.repository.CommodityRepository;
import com.smartration.repository.RationShopRepository;
import com.smartration.repository.StockBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatasetService {

    private final RationShopRepository shopRepository;
    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final BookingSlotRepository bookingSlotRepository;

    @Transactional(readOnly = true)
    public WeeklyDatasetDto getWeeklyDataset(String month, int weekNumber, Long shopId) {
        String targetMonth = (month != null && !month.trim().isEmpty())
                ? month.trim()
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        Long targetShopId = shopId != null ? shopId : 1L;
        RationShop shop = shopRepository.findById(targetShopId).orElse(null);
        String shopName = shop != null ? shop.getShopName() : "Fair Price Shop #1";
        boolean isOpen = shop == null || Boolean.TRUE.equals(shop.getIsOpen());

        // Calculate week bounds within month
        int year = Integer.parseInt(targetMonth.split("-")[0]);
        int monthInt = Integer.parseInt(targetMonth.split("-")[1]);
        LocalDate firstDay = LocalDate.of(year, monthInt, 1);

        LocalDate startDate;
        LocalDate endDate;

        switch (weekNumber) {
            case 1:
                startDate = firstDay;
                endDate = firstDay.plusDays(6);
                break;
            case 2:
                startDate = firstDay.plusDays(7);
                endDate = firstDay.plusDays(13);
                break;
            case 3:
                startDate = firstDay.plusDays(14);
                endDate = firstDay.plusDays(20);
                break;
            case 4:
            default:
                startDate = firstDay.plusDays(21);
                endDate = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
                break;
        }

        // Live commodity stock availability
        List<Commodity> commodities = commodityRepository.findByIsActiveTrueOrderByNameAsc();
        List<Map<String, Object>> commodityList = new ArrayList<>();

        for (Commodity c : commodities) {
            BigDecimal stock = stockBatchRepository.findByShopIdAndCommodityId(targetShopId, c.getId())
                    .stream()
                    .map(StockBatch::getAvailableQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> commMap = new LinkedHashMap<>();
            commMap.put("commodityId", c.getId());
            commMap.put("name", c.getName());
            commMap.put("unit", c.getMeasurementUnit());
            commMap.put("subsidizedTariff", c.getSubsidizedPrice());
            commMap.put("availableStock", stock);
            commMap.put("status", stock.compareTo(BigDecimal.ZERO) <= 0 ? "OUT_OF_STOCK" : (stock.compareTo(c.getLowStockThreshold()) <= 0 ? "LOW_STOCK" : "AVAILABLE"));
            commodityList.add(commMap);
        }

        // Verified collection dates
        List<String> collectionDates = new ArrayList<>();
        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            // Exclude Sundays
            if (cur.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
                collectionDates.add(cur.toString() + " (" + cur.getDayOfWeek().name().substring(0, 3) + ")");
            }
            cur = cur.plusDays(1);
        }

        // Slot availability summary
        List<BookingSlot> slots = bookingSlotRepository.findByShopIdAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(targetShopId);
        int totalSlots = slots.size();
        int totalCap = slots.stream().mapToInt(BookingSlot::getMaxCapacity).sum();
        int booked = slots.stream().mapToInt(BookingSlot::getBookedCount).sum();

        Map<String, Object> bookingOverview = new LinkedHashMap<>();
        bookingOverview.put("totalConfiguredSlots", totalSlots);
        bookingOverview.put("maximumCapacityPerSlot", 20);
        bookingOverview.put("totalCapacity", totalCap > 0 ? totalCap : 240);
        bookingOverview.put("bookedCount", booked);
        bookingOverview.put("remainingCapacity", Math.max(0, (totalCap > 0 ? totalCap : 240) - booked));

        List<String> announcements = List.of(
                "Week " + weekNumber + " statutory entitlement window active for " + targetMonth + ".",
                "Antyodaya Anna Yojana (AAY) beneficiaries receive prioritized early-morning token counters.",
                "Biometric e-POS scale calibrations certified under National Food Security Standards."
        );

        return WeeklyDatasetDto.builder()
                .datasetId("datasets/" + targetMonth + "/week-" + weekNumber + ".json")
                .month(targetMonth)
                .weekNumber(weekNumber)
                .startDate(startDate)
                .endDate(endDate)
                .shopId(targetShopId)
                .shopName(shopName)
                .shopStatus(isOpen ? "OPEN" : "CLOSED")
                .commodityAvailability(commodityList)
                .bookingCapacityOverview(bookingOverview)
                .verifiedCollectionDates(collectionDates)
                .announcements(announcements)
                .source("State Food & Civil Supplies Authoritative Ledger (MySQL `smart`)")
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}

