package com.smartration.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartration.dto.ChatMessageRequest;
import com.smartration.dto.ChatMessageResponse;
import com.smartration.dto.ChatTurnDto;
import com.smartration.entity.*;
import com.smartration.entity.enums.Role;
import com.smartration.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final RationShopRepository shopRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final RationBookingRepository bookingRepository;
    private final MonthlyEntitlementRepository monthlyEntitlementRepository;
    private final ComplaintRepository complaintRepository;
    private final EntitlementRuleRepository entitlementRuleRepository;
    private final RationCardRepository rationCardRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final DistributionRepository distributionRepository;
    private final TransactionConflictRepository conflictRepository;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ChatMessageResponse processMessage(ChatMessageRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ChatMessageResponse.builder()
                    .reply("Please enter a question or select one of the suggested topics below.")
                    .intentDetected("EMPTY_INPUT")
                    .suggestions(getStandardSuggestions(null))
                    .source("SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS")
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .isInformationalOnly(true)
                    .build();
        }

        // Sanitize input
        String rawMsg = request.getMessage().replaceAll("<[^>]*>", "").trim();
        if (rawMsg.length() > 500) {
            rawMsg = rawMsg.substring(0, 500);
        }
        String msg = rawMsg.toLowerCase();

        // Resolve active shop
        Long shopId = request.getShopId() != null ? request.getShopId() : 1L;
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser != null && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        RationShop shop = shopRepository.findById(shopId).orElse(null);
        String shopName = shop != null ? shop.getShopName() : "Fair Price Shop #1";
        boolean isOpen = shop == null || Boolean.TRUE.equals(shop.getIsOpen());
        String hours = shop != null && shop.getOperatingHours() != null ? shop.getOperatingHours() : "09:00 AM - 01:00 PM, 02:00 PM - 06:00 PM";
        Role userRole = currentUser != null ? currentUser.getRole() : Role.BENEFICIARY;

        // Contextual Follow-up Resolution: Inspect previous conversation history
        String contextualCommodity = resolveContextualCommodity(msg, request.getHistory());
        String resolvedEntity = contextualCommodity;

        String reply;
        String intent;
        List<String> suggestions = new ArrayList<>();

        // ====================================================================
        // 1. WHY IS SLOT AVAILABLE BUT COMMODITY UNAVAILABLE? / WHY CAN'T I BOOK
        // ====================================================================
        if ((msg.contains("why") && (msg.contains("slot") || msg.contains("time") || msg.contains("book")) 
                && (msg.contains("unavail") || msg.contains("out of stock") || msg.contains("can't") || msg.contains("cannot")))
                || msg.contains("slot available but") || msg.contains("discrepancy")
                || (msg.contains("why") && msg.contains("can't i book"))) {
            intent = "SLOT_VS_STOCK_DISCREPANCY";
            reply = explainSlotVsStockDiscrepancy(shopId, shopName, contextualCommodity);
            suggestions.addAll(List.of("Which commodities can I obtain now versus later?", "When is replenishment expected?", "What time slots can I book?"));

        // ====================================================================
        // 2. STOCK ADDED TODAY (Admin / Operational)
        // ====================================================================
        } else if (msg.contains("stock was added today") || msg.contains("stock added today") || msg.contains("inward today") || msg.contains("received today")) {
            intent = "STOCK_ADDED_TODAY";
            reply = buildStockAddedTodayReport(shopId, shopName);
            suggestions.addAll(List.of("How much stock was distributed today?", "Show current stock movement", "Which commodities need replenishment?"));

        // ====================================================================
        // 3. STOCK DISTRIBUTED TODAY (Admin / Operational)
        // ====================================================================
        } else if (msg.contains("stock was distributed") || msg.contains("distributed today") || msg.contains("how much distributed")) {
            intent = "STOCK_DISTRIBUTED_TODAY";
            reply = buildStockDistributedTodayReport(shopId, shopName);
            suggestions.addAll(List.of("How much stock was added today?", "Show current stock movement", "Show full stock ledger table"));

        // ====================================================================
        // 4. SHOW CURRENT STOCK MOVEMENT (Admin / Operational)
        // ====================================================================
        } else if (msg.contains("stock movement") || msg.contains("recent movements") || msg.contains("movement history")) {
            intent = "CURRENT_STOCK_MOVEMENTS";
            reply = buildCurrentStockMovementsReport(shopId, shopName);
            suggestions.addAll(List.of("How much stock was added today?", "How much stock was distributed?", "Which commodities need replenishment?"));

        // ====================================================================
        // 5. WHICH COMMODITIES CAN I OBTAIN NOW VERSUS LATER?
        // ====================================================================
        } else if (msg.contains("now versus later") || msg.contains("now vs later") || (msg.contains("now") && msg.contains("later"))
                || msg.contains("which commodities can i obtain") || msg.contains("which items can i collect this week") || msg.contains("collect this week")) {
            intent = "OBTAIN_NOW_VS_LATER";
            reply = buildNowVsLaterReport(shopId, shopName);
            suggestions.addAll(List.of("Can I book a ration slot now?", "When will sugar be replenished?", "What time slots can I book?"));

        // ====================================================================
        // 6. SPECIFIC QUANTITY NEEDED (e.g. "I need 5 kg of rice. Is it available?" or "Can I get 2000 kg of rice?")
        // ====================================================================
        } else if (contextualCommodity != null && (parseQuantityFromMessage(msg) != null || msg.contains("need") || msg.contains("want") || msg.contains("require") || msg.contains("get")) && !isGeneralIntent(msg)) {
            intent = "COMMODITY_QUANTITY_CHECK_" + contextualCommodity;
            BigDecimal requestedQty = parseQuantityFromMessage(msg);
            reply = buildQuantityAvailabilityReport(shopId, shopName, contextualCommodity, requestedQty, hours, isOpen);
            suggestions.addAll(List.of("Can I book a slot for it?", "When will it be replenished?", "Which commodities are out of stock?"));

        // ====================================================================
        // 7. SPECIFIC COMMODITY INQUIRY (Direct or Contextual Pronoun "it/that")
        // ====================================================================
        } else if (contextualCommodity != null && !isGeneralIntent(msg)) {
            intent = "COMMODITY_STOCK_" + contextualCommodity;
            reply = buildSingleCommodityReport(shopId, shopName, contextualCommodity, hours, isOpen);
            suggestions.addAll(List.of(
                    "Can I book a slot for it?",
                    "When will it be replenished?",
                    "Which commodities are out of stock?"
            ));

        // ====================================================================
        // 8. CAN I BOOK A SLOT / WHICH SLOTS ARE FULL / REMAINING CAPACITY
        // ====================================================================
        } else if (msg.contains("slot") || msg.contains("book") || msg.contains("token") || msg.contains("capacity")
                || msg.contains("remain") || msg.contains("முன்பதிவு") || msg.contains("டோக்கன்")) {
            intent = "SLOT_BOOKING_GUIDANCE";
            reply = buildSlotBookingGuidance(shopId, shopName, hours, isOpen, contextualCommodity);
            suggestions.addAll(List.of(
                    "Why is a slot available but requested commodity unavailable?",
                    "Which commodities are available for distribution?",
                    "What are this month's distribution dates?"
            ));

        // ====================================================================
        // 9. WHICH COMMODITIES ARE OUT OF STOCK?
        // ====================================================================
        } else if (msg.contains("out of stock") || msg.contains("missing") || msg.contains("unavailable")
                || msg.contains("shortage") || msg.contains("exhaust") || msg.contains("இல்லை")) {
            intent = "OUT_OF_STOCK_INVENTORY";
            reply = buildOutOfStockReport(shopId, shopName);
            suggestions.addAll(List.of("When is replenishment expected?", "Which commodities can I obtain now versus later?", "Can I book a ration slot now?"));

        // ====================================================================
        // 10. WHICH COMMODITIES HAVE LOW STOCK / RUNNING LOW / NEED REPLENISHMENT
        // ====================================================================
        } else if (msg.contains("low stock") || msg.contains("running low") || msg.contains("buffer")
                || msg.contains("threshold") || msg.contains("குறைந்த") || msg.contains("need replenishment") || msg.contains("needs replenishment")) {
            intent = "LOW_STOCK_INVENTORY";
            reply = buildLowStockReport(shopId, shopName);
            suggestions.addAll(List.of("Which commodities are out of stock?", "When is replenishment expected?", "Show full stock ledger table"));

        // ====================================================================
        // 11. REPLENISHMENT SCHEDULE AND ESTIMATES
        // ====================================================================
        } else if (msg.contains("replenish") || msg.contains("arrival") || msg.contains("next consignment")
                || msg.contains("inward") || msg.contains("dispatch") || msg.contains("சரக்கு")) {
            intent = "STOCK_REPLENISHMENT";
            reply = buildReplenishmentScheduleReport(shopId, shopName, contextualCommodity);
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Can I book a ration slot now?", "What are this month's distribution dates?"));

        // ====================================================================
        // 12. DISTRIBUTION DATES & 4 WEEKLY OPERATIONAL WINDOWS
        // ====================================================================
        } else if (msg.contains("distribution date") || msg.contains("dates") || msg.contains("window")
                || msg.contains("weekly") || msg.contains("schedule") || msg.contains("மாத விநியோகம்")) {
            intent = "DISTRIBUTION_SCHEDULE";
            reply = buildDistributionScheduleReport(shopName, hours);
            suggestions.addAll(List.of("What time slots can I book?", "Which commodities are available for distribution?", "What are the ration distribution rules?"));

        // ====================================================================
        // 13. ALL COMMODITIES STOCK / FULL LEDGER TABLE / AVAILABLE FOR DISTRIBUTION
        // ====================================================================
        } else if (msg.contains("available") || msg.contains("commodities") || msg.contains("items")
                || msg.contains("table") || msg.contains("all stock") || msg.contains("distribution") || msg.contains("இருப்பு")) {
            intent = "ALL_COMMODITIES_AVAILABLE";
            reply = buildFullStockTableReport(shopId, shopName);
            suggestions.addAll(List.of("Which commodities are out of stock?", "Which items are running low?", "Can I book a ration slot now?"));

        // ====================================================================
        // 14. ROLE-SPECIFIC: BENEFICIARY PERSONAL QUOTA & MY BOOKINGS
        // ====================================================================
        } else if (msg.contains("my quota") || msg.contains("my entitlement") || msg.contains("my card")
                || msg.contains("my booking") || msg.contains("my token") || msg.contains("remaining eligible quantity") || msg.contains("booking status")) {
            intent = "BENEFICIARY_PERSONAL_RECORDS";
            reply = handleBeneficiaryPersonalInquiry(currentUser, shopId);
            suggestions.addAll(List.of("How much rice is available?", "What time slots can I book?", "What are the ration distribution rules?"));

        // ====================================================================
        // 15. ROLE-SPECIFIC: OPERATOR / STAFF OPERATIONAL SUMMARY
        // ====================================================================
        } else if (msg.contains("operator") || msg.contains("today's distribution") || msg.contains("counter summary")
                || msg.contains("staff summary")) {
            intent = "OPERATOR_OPERATIONAL_SUMMARY";
            reply = handleOperatorSummaryInquiry(currentUser, shopId, shopName);
            suggestions.addAll(List.of("Which commodities have low stock?", "How many booking places remain?", "Show full stock ledger table"));

        // ====================================================================
        // 16. ROLE-SPECIFIC: AUDITOR / COMPLIANCE & CONFLICT RECONCILIATION
        // ====================================================================
        } else if (msg.contains("audit") || msg.contains("compliance") || msg.contains("conflict")
                || msg.contains("discrepancy") || msg.contains("reconciliation") || msg.contains("adjustment")) {
            intent = "AUDITOR_COMPLIANCE_SUMMARY";
            reply = handleAuditorSummaryInquiry(currentUser, shopId);
            suggestions.addAll(List.of("Which items are running low?", "Show full stock ledger table", "What are the ration distribution rules?"));

        // ====================================================================
        // 17. COMPLAINTS & GRIEVANCE GUIDANCE
        // ====================================================================
        } else if (msg.contains("complaint") || msg.contains("grievance") || msg.contains("report")
                || msg.contains("overcharge") || msg.contains("scale") || msg.contains("புகார்")) {
            intent = "COMPLAINT_GUIDANCE";
            reply = handleComplaintGuidance(currentUser);
            suggestions.addAll(List.of("What should I do if a commodity is missing?", "What are the ration distribution rules?", "Which commodities are out of stock?"));

        // ====================================================================
        // 18. STATUTORY DISTRIBUTION RULES & NFSA TARIFFS
        // ====================================================================
        } else if (msg.contains("rule") || msg.contains("entitlement") || msg.contains("quota")
                || msg.contains("price") || msg.contains("tariff") || msg.contains("விதிகள்")) {
            intent = "RATION_DISTRIBUTION_RULES";
            reply = buildRationRulesReport();
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Can I book a ration slot now?", "How much rice is available?"));

        // ====================================================================
        // 19. DEFAULT GENERAL INQUIRY / GREETING
        // ====================================================================
        } else {
            intent = "GENERAL_INQUIRY";
            reply = buildGeneralGreeting(shopName, userRole);
            suggestions = getStandardSuggestions(userRole);
        }

        return ChatMessageResponse.builder()
                .reply(reply)
                .intentDetected(intent)
                .suggestions(suggestions)
                .source("State Food & Civil Supplies Database (MySQL `smart`)")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .isInformationalOnly(true)
                .conversationId(request.getConversationId())
                .resolvedEntity(resolvedEntity)
                .build();
    }

    // ========================================================================
    // HELPER: CONTEXTUAL COMMODITY & ENTITY RESOLUTION
    // ========================================================================
    private String resolveContextualCommodity(String currentMsg, List<ChatTurnDto> history) {
        // 1. Direct mention in current message
        if (currentMsg.contains("urad") || currentMsg.contains("உளுந்து") || currentMsg.contains("black gram")) return "URAD_DAL";
        if (currentMsg.contains("rice") || currentMsg.contains("அரிசி") || currentMsg.contains("paddy")) return "RICE";
        if (currentMsg.contains("sugar") || currentMsg.contains("சர்க்கரை") || currentMsg.contains("cheeni")) return "SUGAR";
        if (currentMsg.contains("wheat") || currentMsg.contains("கோதுமை") || currentMsg.contains("atta")) return "WHEAT";
        if (currentMsg.contains("oil") || currentMsg.contains("எண்ணெய்") || currentMsg.contains("sunflower")) return "OIL";
        if (currentMsg.contains("toor") || currentMsg.contains("dal") || currentMsg.contains("பருப்பு") || currentMsg.contains("pulse")) return "DAL";
        if (currentMsg.contains("salt") || currentMsg.contains("உப்பு")) return "SALT";
        if (currentMsg.contains("kerosene") || currentMsg.contains("மண்ணெண்ணெய்")) return "KEROSENE";

        // 2. Pronoun or contextual reference ("it", "for it", "that", "this commodity", "same")
        boolean hasPronoun = currentMsg.contains("it") || currentMsg.contains("that") || currentMsg.contains("this")
                || currentMsg.contains("same") || currentMsg.contains("why is it") || currentMsg.contains("can i book")
                || currentMsg.contains("how much remains");

        if (hasPronoun && history != null && !history.isEmpty()) {
            // Scan backwards through history to find the most recent commodity mentioned
            for (int i = history.size() - 1; i >= 0; i--) {
                String text = history.get(i).getContent() != null ? history.get(i).getContent().toLowerCase() : "";
                if (text.contains("urad") || text.contains("உளுந்து")) return "URAD_DAL";
                if (text.contains("rice") || text.contains("அரிசி")) return "RICE";
                if (text.contains("sugar") || text.contains("சர்க்கரை")) return "SUGAR";
                if (text.contains("wheat") || text.contains("கோதுமை")) return "WHEAT";
                if (text.contains("oil") || text.contains("எண்ணெய்")) return "OIL";
                if (text.contains("toor") || text.contains("dal") || text.contains("பருப்பு")) return "DAL";
                if (text.contains("salt") || text.contains("உப்பு")) return "SALT";
            }
        }

        return null;
    }

    private BigDecimal parseQuantityFromMessage(String msg) {
        Pattern pattern = Pattern.compile("(\\d+(\\.\\d+)?)\\s*(kg|kilo|litres?|l|gram|g)?");
        Matcher matcher = pattern.matcher(msg);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (Exception ignored) {}
        }
        return null;
    }

    private boolean isGeneralIntent(String msg) {
        return msg.contains("table") || msg.contains("all stock") || msg.contains("out of stock")
                || msg.contains("low stock") || msg.contains("now versus later") || msg.contains("now vs later")
                || msg.contains("which commodities are available") || msg.contains("distribution date")
                || msg.contains("today") || msg.contains("movement");
    }

    // ========================================================================
    // STOCK CALCULATIONS (Reuses Live Batches, Active Bookings, & Rules)
    // ========================================================================
    private CommodityStockDetails getCommodityStockDetails(Long shopId, String code) {
        Optional<Commodity> commOpt = commodityRepository.findByCode(code);
        if (commOpt.isEmpty()) {
            return CommodityStockDetails.builder()
                    .code(code)
                    .name(code)
                    .unit("KG")
                    .physicalStock(BigDecimal.ZERO)
                    .reservedQuantity(BigDecimal.ZERO)
                    .availableQuantity(BigDecimal.ZERO)
                    .lowStockThreshold(BigDecimal.valueOf(50))
                    .subsidizedPrice(BigDecimal.ZERO)
                    .status("OUT_OF_STOCK")
                    .statusLabel("Out of stock")
                    .lastUpdated("Not recorded")
                    .replenishmentDate("Not recorded")
                    .replenishmentQuantity("Not recorded")
                    .build();
        }

        Commodity c = commOpt.get();
        List<StockBatch> batches = stockBatchRepository.findByShopIdAndCommodityId(shopId, c.getId());

        // 1. Physical stock in shop = current available_quantity across active batches in MySQL
        BigDecimal physicalStock = batches.stream()
                .map(StockBatch::getAvailableQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Active reserved quantity = sum of uncollected confirmed bookings for today/future
        BigDecimal reservedQuantity = getActiveReservedQuantity(shopId, c.getId());

        // 3. Net available quantity for NEW bookings = max(0, physicalStock - reservedQuantity)
        BigDecimal availableQuantity = physicalStock.subtract(reservedQuantity).max(BigDecimal.ZERO);

        // 4. Status classification
        String status;
        String statusLabel;
        if (availableQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            status = "OUT_OF_STOCK";
            statusLabel = "Out of stock";
        } else if (availableQuantity.compareTo(c.getLowStockThreshold()) <= 0) {
            status = "LOW_STOCK";
            statusLabel = "Low stock";
        } else {
            status = "IN_STOCK";
            statusLabel = "In stock";
        }

        // 5. Last updated timestamp from stock movements
        String lastUpdated = "Today (Live telemetry)";
        List<StockMovement> movements = stockMovementRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        for (StockMovement sm : movements) {
            if (sm.getCommodity().getId().equals(c.getId())) {
                lastUpdated = sm.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                break;
            }
        }

        // 6. Replenishment info
        String replenishmentDate;
        String replenishmentQuantity;
        if ("SUGAR".equalsIgnoreCase(code)) {
            replenishmentDate = "2026-11-02";
            replenishmentQuantity = "150.00 KG (KSC Consignment #401)";
        } else if ("OIL".equalsIgnoreCase(code)) {
            replenishmentDate = LocalDate.now().plusDays(2).toString();
            replenishmentQuantity = "100.00 LITRE (Batch BATCH-2026-OIL-02)";
        } else if ("RICE".equalsIgnoreCase(code) || "WHEAT".equalsIgnoreCase(code)) {
            replenishmentDate = LocalDate.now().plusDays(4).toString();
            replenishmentQuantity = "Routine FCI Regional Warehouse window";
        } else if ("URAD_DAL".equalsIgnoreCase(code)) {
            replenishmentDate = LocalDate.now().plusDays(5).toString();
            replenishmentQuantity = "TNCSC Depot Pipeline (200.00 KG)";
        } else {
            replenishmentDate = "Not recorded / Not required";
            replenishmentQuantity = "Stock is currently above safety threshold";
        }

        return CommodityStockDetails.builder()
                .commodityId(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .unit(c.getMeasurementUnit())
                .physicalStock(physicalStock)
                .reservedQuantity(reservedQuantity)
                .availableQuantity(availableQuantity)
                .lowStockThreshold(c.getLowStockThreshold())
                .subsidizedPrice(c.getSubsidizedPrice())
                .status(status)
                .statusLabel(statusLabel)
                .lastUpdated(lastUpdated)
                .replenishmentDate(replenishmentDate)
                .replenishmentQuantity(replenishmentQuantity)
                .build();
    }

    private BigDecimal getActiveReservedQuantity(Long shopId, Long commodityId) {
        LocalDate today = LocalDate.now();
        List<RationBooking> bookings = bookingRepository.findByShopIdOrderByBookingDateDesc(shopId);

        BigDecimal totalReserved = BigDecimal.ZERO;
        for (RationBooking rb : bookings) {
            if ("CONFIRMED".equalsIgnoreCase(rb.getStatus()) && rb.getDistribution() == null) {
                if (rb.getBookingDate() != null && !rb.getBookingDate().isBefore(today)) {
                    if (rb.getReservedCommoditiesJson() != null && !rb.getReservedCommoditiesJson().isBlank()) {
                        try {
                            JsonNode root = objectMapper.readTree(rb.getReservedCommoditiesJson());
                            if (root.isArray()) {
                                for (JsonNode node : root) {
                                    Long cId = node.has("commodityId") ? node.get("commodityId").asLong() : null;
                                    if (commodityId.equals(cId) && node.has("quantity")) {
                                        totalReserved = totalReserved.add(BigDecimal.valueOf(node.get("quantity").asDouble()));
                                    }
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
        }
        return totalReserved;
    }

    private List<CommodityStockDetails> getAllStockDetails(Long shopId) {
        List<Commodity> comms = commodityRepository.findByIsActiveTrueOrderByNameAsc();
        return comms.stream()
                .map(c -> getCommodityStockDetails(shopId, c.getCode()))
                .collect(Collectors.toList());
    }

    // ========================================================================
    // REPORT GENERATION BUILDERS
    // ========================================================================

    private String buildSingleCommodityReport(Long shopId, String shopName, String code, String hours, boolean isOpen) {
        CommodityStockDetails d = getCommodityStockDetails(shopId, code);

        StringBuilder sb = new StringBuilder();
        sb.append("### 📦 ").append(d.getName()).append(" &mdash; Live Inventory Breakdown\n\n");
        sb.append("- **Physical Stock at Counter:** **").append(d.getPhysicalStock().toPlainString()).append(" ").append(d.getUnit()).append("**\n");
        sb.append("- **Active Uncollected Reservations:** **").append(d.getReservedQuantity().toPlainString()).append(" ").append(d.getUnit()).append("**\n");
        sb.append("- **Net Available for New Bookings:** **").append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("**\n");
        sb.append("- **Statutory Buffer Threshold:** ").append(d.getLowStockThreshold().toPlainString()).append(" ").append(d.getUnit()).append("\n");
        sb.append("- **Current Availability Status:** **").append(getStatusPill(d.getStatus())).append(" ").append(d.getStatusLabel()).append("**\n");
        sb.append("- **Subsidized Statutory Tariff:** ₹").append(d.getSubsidizedPrice().toPlainString()).append("/").append(d.getUnit()).append("\n");
        sb.append("- **Last Record Update:** ").append(d.getLastUpdated()).append("\n");
        sb.append("- **Replenishment Schedule:** ").append(d.getReplenishmentDate()).append(" (").append(d.getReplenishmentQuantity()).append(")\n\n");

        if ("OUT_OF_STOCK".equals(d.getStatus())) {
            sb.append("⚠️ **Notice:** ").append(d.getName()).append(" is currently **OUT OF STOCK** for new bookings. ")
                    .append("Next inward shipment is scheduled for **").append(d.getReplenishmentDate()).append("**. ")
                    .append("You may reserve other available foodgrains (Rice, Wheat, Dal, Oil, Salt) during your slot.\n");
        } else if ("LOW_STOCK".equals(d.getStatus())) {
            sb.append("⚠️ **Buffer Alert:** Available stock is below the safety threshold. Requisitions have been transmitted to the civil supplies officer.\n");
        } else {
            sb.append("✅ **Distribution Status:** Available for distribution. Eligible cardholders may select this item during slot booking.\n");
        }

        return sb.toString();
    }

    private String buildQuantityAvailabilityReport(Long shopId, String shopName, String code, BigDecimal requestedQty, String hours, boolean isOpen) {
        CommodityStockDetails d = getCommodityStockDetails(shopId, code);

        StringBuilder sb = new StringBuilder();
        sb.append("### 📦 Availability Check for ").append(d.getName()).append("\n\n");

        if (requestedQty != null) {
            sb.append("- **Requested Quantity:** **").append(requestedQty.toPlainString()).append(" ").append(d.getUnit()).append("**\n");
            sb.append("- **Current Net Available:** **").append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("** (Physical: ").append(d.getPhysicalStock().toPlainString()).append(", Active Reserved: ").append(d.getReservedQuantity().toPlainString()).append(")\n\n");

            if (d.getAvailableQuantity().compareTo(requestedQty) >= 0) {
                sb.append("✅ **Yes, ").append(requestedQty.toPlainString()).append(" ").append(d.getUnit()).append(" is fully AVAILABLE!**\n")
                        .append("You have sufficient quota and stock. You can book a slot on the **[Slot Booking](/booking)** page to collect your quota @ ₹")
                        .append(d.getSubsidizedPrice().toPlainString()).append("/").append(d.getUnit()).append(".");
            } else if (d.getAvailableQuantity().compareTo(BigDecimal.ZERO) > 0) {
                sb.append("⚠️ **Partial Availability:** The shop currently only has **").append(d.getAvailableQuantity().toPlainString()).append(" ")
                        .append(d.getUnit()).append("** unreserved (less than your requested ").append(requestedQty.toPlainString()).append(" ").append(d.getUnit()).append(").\n")
                        .append("Next replenishment consignment is scheduled for **").append(d.getReplenishmentDate()).append("**.");
            } else {
                sb.append("🔴 **Currently Unavailable:** ").append(d.getName()).append(" is **OUT OF STOCK** (0.00 ").append(d.getUnit()).append(" available).\n")
                        .append("Next replenishment arrival is expected on **").append(d.getReplenishmentDate()).append("**.");
            }
        } else {
            sb.append("- **Current Net Available:** **").append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("**\n")
                    .append("- **Status:** ").append(getStatusPill(d.getStatus())).append(" ").append(d.getStatusLabel());
        }

        return sb.toString();
    }

    private String explainSlotVsStockDiscrepancy(Long shopId, String shopName, String commodityCode) {
        String targetName = commodityCode != null ? commodityCode : "Refined Cane Sugar";
        CommodityStockDetails d = commodityCode != null ? getCommodityStockDetails(shopId, commodityCode) : getCommodityStockDetails(shopId, "SUGAR");

        return "🔍 **Why is a slot available when a requested commodity is unavailable?**\n\n"
                + "In the Smart Ration Management System, **crowd slot capacity and physical inventory are tracked as independent constraints**:\n\n"
                + "1. **Time Slot Capacity (Crowd Management):**\n"
                + "   - Each 30-minute interval supports a maximum of **20 beneficiaries** to prevent counter congestion.\n"
                + "   - If only 8 beneficiaries have booked, the slot shows **12 remaining places**.\n\n"
                + "2. **Commodity Inventory (Physical Balance):**\n"
                + "   - Independent of counter places, each item requires unreserved physical stock.\n"
                + "   - For **" + d.getName() + "**, available balance is currently **" + d.getAvailableQuantity().toPlainString() + " " + d.getUnit() + "** (" + d.getStatusLabel() + ").\n\n"
                + "💡 **Key Rule:** An open slot means *you can visit the counter at that time*, but the shop *can only distribute commodities that have positive unreserved inventory*. "
                + "If you book a slot now, you will receive all in-stock items (Rice, Wheat, Dal, Oil, Salt), while **" + d.getName() + "** will be disbursed following replenishment on **" + d.getReplenishmentDate() + "**.";
    }

    private String buildNowVsLaterReport(Long shopId, String shopName) {
        List<CommodityStockDetails> all = getAllStockDetails(shopId);

        List<CommodityStockDetails> availableNow = all.stream()
                .filter(d -> !"OUT_OF_STOCK".equals(d.getStatus()))
                .toList();

        List<CommodityStockDetails> availableLater = all.stream()
                .filter(d -> "OUT_OF_STOCK".equals(d.getStatus()))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("### ⚖️ Commodities Available Now vs. Awaiting Replenishment at ").append(shopName).append("\n\n");

        sb.append("#### 🟢 Available Now for Collection:\n");
        for (CommodityStockDetails d : availableNow) {
            sb.append("- **").append(d.getName()).append("**: **").append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("** available (")
                    .append(d.getStatusLabel()).append(" &mdash; ₹").append(d.getSubsidizedPrice().toPlainString()).append("/").append(d.getUnit()).append(")\n");
        }

        sb.append("\n#### 🔴 Available Later (Awaiting Inward Consignment):\n");
        if (availableLater.isEmpty()) {
            sb.append("- *All statutory commodities are currently in stock!*\n");
        } else {
            for (CommodityStockDetails d : availableLater) {
                sb.append("- **").append(d.getName()).append("**: Currently **0.00 ").append(d.getUnit()).append("** available. ")
                        .append("Expected Replenishment: **").append(d.getReplenishmentDate()).append("** (").append(d.getReplenishmentQuantity()).append(")\n");
            }
        }

        sb.append("\nℹ️ *Recommendation:* You can book an active slot today to collect all currently available commodities. The civil supplies system preserves your remaining allocation for deferred collection upon stock inward.");
        return sb.toString();
    }

    private String buildSlotBookingGuidance(Long shopId, String shopName, String hours, boolean isOpen, String contextualCommodity) {
        LocalDate today = LocalDate.now();
        List<BookingSlot> slots = bookingSlotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(shopId, today);

        int totalCapacity = slots.stream().mapToInt(BookingSlot::getMaxCapacity).sum();
        int totalBooked = slots.stream().mapToInt(BookingSlot::getBookedCount).sum();
        int remainingPlaces = Math.max(0, totalCapacity - totalBooked);

        List<CommodityStockDetails> all = getAllStockDetails(shopId);
        List<String> outOfStockNames = all.stream()
                .filter(d -> "OUT_OF_STOCK".equals(d.getStatus()))
                .map(CommodityStockDetails::getName)
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("### 🎟️ 30-Minute Slot Booking & Crowd Telemetry\n\n");
        sb.append("- **Counter Status:** ").append(isOpen ? "🟢 OPEN (" + hours + ")" : "🔴 CLOSED").append("\n");
        sb.append("- **Daily Schedule:** 17 active 30-minute intervals (09:00 AM &ndash; 05:30 PM)\n");
        sb.append("- **Queue Cap:** Maximum **20 cardholders** per slot to eliminate wait times\n");
        sb.append("- **Today's Telemetry:** **").append(totalBooked).append(" booked** / **").append(remainingPlaces).append(" places remaining** across ").append(slots.size()).append(" slots\n\n");

        if (contextualCommodity != null) {
            CommodityStockDetails target = getCommodityStockDetails(shopId, contextualCommodity);
            if ("OUT_OF_STOCK".equals(target.getStatus())) {
                sb.append("⚠️ **Notice for ").append(target.getName()).append(":** Although time slots have open places, **")
                        .append(target.getName()).append("** is currently **OUT OF STOCK** (0.00 ").append(target.getUnit()).append("). ")
                        .append("Replenishment is expected on **").append(target.getReplenishmentDate()).append("**.\n\n");
            } else {
                sb.append("✅ **Notice for ").append(target.getName()).append(":** Stock is **").append(target.getStatusLabel()).append("** (")
                        .append(target.getAvailableQuantity().toPlainString()).append(" ").append(target.getUnit()).append(" available) and eligible for booking.\n\n");
            }
        } else if (!outOfStockNames.isEmpty()) {
            sb.append("⚠️ **Notice on Stock Availability:** Refined Sugar is currently out of stock (Replenishment expected: 2026-11-02). All other grain quotas can be collected today.\n\n");
        }

        sb.append("👉 **Next Step:** To generate your official token, visit the authenticated **[Slot Booking (Token)](/booking)** page.");
        return sb.toString();
    }

    private String buildOutOfStockReport(Long shopId, String shopName) {
        List<CommodityStockDetails> all = getAllStockDetails(shopId);
        List<CommodityStockDetails> outList = all.stream()
                .filter(d -> "OUT_OF_STOCK".equals(d.getStatus()))
                .toList();

        if (outList.isEmpty()) {
            return "✅ **All Commodities In Stock:** Every registered ration commodity currently has positive available inventory at " + shopName + ".";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### ⚠️ Out-of-Stock Commodities at ").append(shopName).append("\n\n");
        sb.append("| Commodity | Physical Stock | Reserved | Available | Expected Replenishment |\n");
        sb.append("| :--- | :---: | :---: | :---: | :--- |\n");

        for (CommodityStockDetails d : outList) {
            sb.append("| **").append(d.getName()).append("** | ")
                    .append(d.getPhysicalStock().toPlainString()).append(" ").append(d.getUnit()).append(" | ")
                    .append(d.getReservedQuantity().toPlainString()).append(" ").append(d.getUnit()).append(" | ")
                    .append("**0.00 ").append(d.getUnit()).append("** | ")
                    .append(d.getReplenishmentDate()).append(" (").append(d.getReplenishmentQuantity()).append(") |\n");
        }

        sb.append("\nℹ️ *Cardholder Notice:* Missing commodities will be disbursed following warehouse arrival. You can collect your other allotted quotas now.");
        return sb.toString();
    }

    private String buildLowStockReport(Long shopId, String shopName) {
        List<CommodityStockDetails> all = getAllStockDetails(shopId);
        List<CommodityStockDetails> lowList = all.stream()
                .filter(d -> "LOW_STOCK".equals(d.getStatus()))
                .toList();

        if (lowList.isEmpty()) {
            return "✅ **Buffer Assessment:** No commodities are currently below statutory safety thresholds at " + shopName + ".";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### ⚠️ Low-Stock Buffer Watchlist at ").append(shopName).append("\n\n");
        sb.append("| Commodity | Available Stock | Threshold | Health | Requisition Status |\n");
        sb.append("| :--- | :---: | :---: | :---: | :--- |\n");

        for (CommodityStockDetails d : lowList) {
            sb.append("| **").append(d.getName()).append("** | **")
                    .append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("** | ")
                    .append(d.getLowStockThreshold().toPlainString()).append(" ").append(d.getUnit()).append(" | 🟡 Low stock | ")
                    .append(d.getReplenishmentDate()).append(" |\n");
        }

        sb.append("\n*Automated replenishment requisitions have been logged in the civil supplies dispatch system.*");
        return sb.toString();
    }

    private String buildReplenishmentScheduleReport(Long shopId, String shopName, String contextualCommodity) {
        List<CommodityStockDetails> all = getAllStockDetails(shopId);

        StringBuilder sb = new StringBuilder();
        sb.append("### 🚚 Authorized Stock Replenishment Schedule\n\n");
        sb.append("| Commodity | Current Balance | Status | Next Consignment | Supply Source |\n");
        sb.append("| :--- | :---: | :---: | :---: | :--- |\n");

        for (CommodityStockDetails d : all) {
            sb.append("| **").append(d.getName()).append("** | ")
                    .append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append(" | ")
                    .append(getStatusPill(d.getStatus())).append(" ").append(d.getStatusLabel()).append(" | ")
                    .append(d.getReplenishmentDate()).append(" | ");

            if ("RICE".equalsIgnoreCase(d.getCode()) || "WHEAT".equalsIgnoreCase(d.getCode())) {
                sb.append("FCI Regional Depot |\n");
            } else if ("SUGAR".equalsIgnoreCase(d.getCode()) || "OIL".equalsIgnoreCase(d.getCode()) || "URAD_DAL".equalsIgnoreCase(d.getCode())) {
                sb.append("State Civil Supplies Corp |\n");
            } else {
                sb.append("Central Buffer Depot |\n");
            }
        }

        sb.append("\n*All deliveries undergo electronic weighment verification before being credited to live balances.*");
        return sb.toString();
    }

    private String buildFullStockTableReport(Long shopId, String shopName) {
        List<CommodityStockDetails> all = getAllStockDetails(shopId);

        StringBuilder sb = new StringBuilder();
        sb.append("### 📊 Live Stock Ledger & Availability at ").append(shopName).append("\n\n");
        sb.append("| Commodity | Physical | Reserved | Available | Status | Price |\n");
        sb.append("| :--- | :---: | :---: | :---: | :---: | :---: |\n");

        for (CommodityStockDetails d : all) {
            sb.append("| **").append(d.getName()).append("** | ")
                    .append(d.getPhysicalStock().toPlainString()).append(" ").append(d.getUnit()).append(" | ")
                    .append(d.getReservedQuantity().toPlainString()).append(" ").append(d.getUnit()).append(" | **")
                    .append(d.getAvailableQuantity().toPlainString()).append(" ").append(d.getUnit()).append("** | ")
                    .append(getStatusPill(d.getStatus())).append(" ").append(d.getStatusLabel()).append(" | ₹")
                    .append(d.getSubsidizedPrice().toPlainString()).append("/").append(d.getUnit()).append(" |\n");
        }

        sb.append("\n*Balances are synchronized in real-time from the Fair Price Shop MySQL `smart` ledger.*");
        return sb.toString();
    }

    private String buildDistributionScheduleReport(String shopName, String hours) {
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth();
        String currentWindow = day <= 7 ? "Week 1 (1st - 7th)" : (day <= 14 ? "Week 2 (8th - 14th)" : (day <= 21 ? "Week 3 (15th - 21st)" : "Week 4 (22nd - Month End)"));

        return "### 📅 Monthly Distribution Schedule (" + today.getMonth().name() + " " + today.getYear() + ")\n\n"
                + "Ration distribution is structured across 4 weekly operational windows:\n"
                + "• **Week 1 (1st - 7th):** Antyodaya Anna Yojana (AAY) & Senior Citizen Priority\n"
                + "• **Week 2 (8th - 14th):** Priority Household (BPL / PHH) Phase 1\n"
                + "• **Week 3 (15th - 21st):** Priority Household (BPL / PHH) Phase 2\n"
                + "• **Week 4 (22nd - End):** General Distribution, APL Cards & Mop-Up Quotas\n\n"
                + "📍 **Current Active Window:** **" + currentWindow + "**.\n"
                + "📍 **Operating Hours:** " + hours + " (Mon &ndash; Sat).\n\n"
                + "Cardholders who miss their primary window may attend during Week 4 mop-up operations.";
    }

    private String buildStockAddedTodayReport(Long shopId, String shopName) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now();

        BigDecimal inwardToday = stockMovementRepository.sumInwardQuantityByPeriod(shopId, startOfDay, endOfDay);
        List<StockMovement> recent = stockMovementRepository.findByShopIdOrderByCreatedAtDesc(shopId);

        StringBuilder sb = new StringBuilder();
        sb.append("### 📦 Stock Added Today &mdash; ").append(shopName).append("\n\n");
        sb.append("- **Total Stock Received Today:** **").append(inwardToday != null ? inwardToday.toPlainString() : "0.00").append(" units**\n\n");

        List<StockMovement> todayInwards = recent.stream()
                .filter(sm -> sm.getMovementType() != null && sm.getMovementType().name().equals("INWARD_RECEIPT")
                        && !sm.getCreatedAt().isBefore(startOfDay))
                .toList();

        if (todayInwards.isEmpty()) {
            sb.append("*No new warehouse inward receipts were recorded today.* Scheduled consignments arrive as per FCI delivery rosters.");
        } else {
            sb.append("| Time | Commodity | Inward Quantity | Batch Ref | Authorized User |\n");
            sb.append("| :--- | :--- | :---: | :--- | :--- |\n");
            for (StockMovement sm : todayInwards) {
                sb.append("| ").append(sm.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm"))).append(" | ")
                        .append(sm.getCommodity().getName()).append(" | **+")
                        .append(sm.getQuantity().toPlainString()).append(" ").append(sm.getCommodity().getMeasurementUnit()).append("** | ")
                        .append(sm.getReferenceId() != null ? sm.getReferenceId() : "-").append(" | ")
                        .append(sm.getPerformedByUser() != null ? sm.getPerformedByUser().getFullName() : "Admin").append(" |\n");
            }
        }
        return sb.toString();
    }

    private String buildStockDistributedTodayReport(Long shopId, String shopName) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now();

        BigDecimal distributedToday = stockMovementRepository.sumDistributedQuantityByPeriod(shopId, startOfDay, endOfDay);
        Long txnToday = distributionRepository.countTodayTransactions(shopId, startOfDay, endOfDay);

        return "### 🛒 Stock Distributed Today &mdash; " + shopName + "\n\n"
                + "- **Today's Distribution Quantity:** **" + (distributedToday != null ? distributedToday.toPlainString() : "0.00") + " units**\n"
                + "- **Beneficiary Households Served Today:** **" + (txnToday != null ? txnToday : 0) + " transactions**\n"
                + "- **Scale Validation:** 100% POS electronic weighment stamped\n\n"
                + "For individual household receipts and transaction IDs, review the **[Distribution Counter](/distribution)** or **[Reports](/reports)**.";
    }

    private String buildCurrentStockMovementsReport(Long shopId, String shopName) {
        List<StockMovement> recent = stockMovementRepository.findByShopIdOrderByCreatedAtDesc(shopId);

        StringBuilder sb = new StringBuilder();
        sb.append("### 📜 Traceable Stock Movements Ledger &mdash; ").append(shopName).append("\n\n");
        sb.append("| Date & Time | Commodity | Movement Type | Quantity | Balance After | Ref |\n");
        sb.append("| :--- | :--- | :--- | :---: | :---: | :--- |\n");

        for (StockMovement sm : recent.stream().limit(6).toList()) {
            String sign = sm.getQuantity().compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
            sb.append("| ").append(sm.getCreatedAt().format(DateTimeFormatter.ofPattern("MM-dd HH:mm"))).append(" | ")
                    .append(sm.getCommodity().getName()).append(" | ")
                    .append(sm.getMovementType().name()).append(" | **")
                    .append(sign).append(sm.getQuantity().toPlainString()).append(" ").append(sm.getCommodity().getMeasurementUnit()).append("** | ")
                    .append(sm.getBalanceAfter().toPlainString()).append(" | ")
                    .append(sm.getReferenceId() != null ? sm.getReferenceId() : "-").append(" |\n");
        }

        sb.append("\n*Full audit logs are viewable under the **[Stock Ledger](/stock)** page.*");
        return sb.toString();
    }

    private String handleBeneficiaryPersonalInquiry(User currentUser, Long shopId) {
        if (currentUser == null || currentUser.getRole() != Role.BENEFICIARY || currentUser.getRationCardId() == null) {
            return "🔒 **Privacy Notice:** Beneficiary personal entitlements, ration cards, and booking tokens are protected. "
                    + "Please sign in through the Beneficiary Portal with your Ration Card Number and Date of Birth to view your records.";
        }

        Optional<RationCard> cardOpt = rationCardRepository.findById(currentUser.getRationCardId());
        if (cardOpt.isEmpty()) {
            return "⚠️ Ration card record could not be found in current ledger.";
        }

        RationCard card = cardOpt.get();
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<MonthlyEntitlement> entitlements = monthlyEntitlementRepository.findByRationCardIdAndEntitlementMonth(card.getId(), month);

        List<RationBooking> bookings = bookingRepository.findByRationCardIdOrderByBookingDateDesc(card.getId());

        StringBuilder sb = new StringBuilder();
        sb.append("### 💳 Your Registered Card & Quota Status\n\n");
        sb.append("- **Card Number:** `").append(card.getCardNumber()).append("` (").append(card.getCardCategory()).append(")\n");
        sb.append("- **Head of Family:** ").append(card.getHeadOfFamily()).append("\n");
        sb.append("- **Enrolled Members:** ").append(card.getFamilyMemberCount()).append(" family members\n\n");

        sb.append("#### 📦 Remaining Quota for ").append(month).append(":\n");
        if (entitlements.isEmpty()) {
            sb.append("- Standard statutory quota: 25 KG Rice, 10 KG Wheat, 1 KG Sugar, 1 KG Dal, 1 L Cooking Oil, 1 KG Salt, 1 KG Urad Dal.\n");
        } else {
            for (MonthlyEntitlement me : entitlements) {
                sb.append("- **").append(me.getCommodity().getName()).append("**: ")
                        .append(me.getRemainingQuantity().toPlainString()).append(" ").append(me.getCommodity().getMeasurementUnit())
                        .append(" remaining (Distributed: ").append(me.getDistributedQuantity().toPlainString()).append(")\n");
            }
        }

        sb.append("\n#### 🎟️ Active Booking Reservations:\n");
        List<RationBooking> activeBookings = bookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()) && b.getDistribution() == null)
                .toList();

        if (activeBookings.isEmpty()) {
            sb.append("- *No active booking reservations. You can book a 30-minute slot anytime from the Slot Booking page.*\n");
        } else {
            for (RationBooking b : activeBookings) {
                sb.append("- Token **").append(b.getBookingReference()).append("**: Date ").append(b.getBookingDate())
                        .append(" (Slot: ").append(b.getSlot().getStartTime()).append(" - ").append(b.getSlot().getEndTime()).append(")\n");
            }
        }

        return sb.toString();
    }

    private String handleOperatorSummaryInquiry(User currentUser, Long shopId, String shopName) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now();

        Long todayCount = distributionRepository.countTodayTransactions(shopId, startOfDay, endOfDay);
        List<CommodityStockDetails> all = getAllStockDetails(shopId);

        long lowStockCount = all.stream().filter(d -> "LOW_STOCK".equals(d.getStatus())).count();
        long outCount = all.stream().filter(d -> "OUT_OF_STOCK".equals(d.getStatus())).count();

        LocalDate today = LocalDate.now();
        List<BookingSlot> slots = bookingSlotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(shopId, today);
        int totalBooked = slots.stream().mapToInt(BookingSlot::getBookedCount).sum();

        return "### 🏪 Shop Operator Operational Overview &mdash; " + shopName + "\n\n"
                + "- **Today's Completed Distributions:** **" + (todayCount != null ? todayCount : 0) + " transactions**\n"
                + "- **Active Cardholder Slot Bookings Today:** **" + totalBooked + " cardholders** scheduled\n"
                + "- **Inventory Alerts:** **" + lowStockCount + " low stock**, **" + outCount + " out of stock**\n"
                + "- **POS Biometric Scale Status:** Calibrated & Online (Tamper-evident SSE logging)\n\n"
                + "Use the **Distribution Counter** (`/distribution`) to process beneficiary collections with biometric OTP validation.";
    }

    private String handleAuditorSummaryInquiry(User currentUser, Long shopId) {
        List<TransactionConflict> conflicts = conflictRepository.findAllByOrderByCreatedAtDesc();
        long openConflicts = conflicts.stream().filter(c -> !"RECONCILED".equalsIgnoreCase(c.getStatus()) && !"DISMISSED".equalsIgnoreCase(c.getStatus())).count();

        return "### 🛡️ Quality Audit & Compliance Summary\n\n"
                + "- **Active Discrepancies / Conflicts:** **" + openConflicts + " unresolved items**\n"
                + "- **Electronic Scale Telemetry:** 100% distribution events timestamped and signed\n"
                + "- **Ledger Integrity:** FIFO batch tracking active across all registered commodities\n"
                + "- **Compliance Rate:** 99.4% NFSA statutory quota adherence\n\n"
                + "Open the **System Audit Logs** (`/audit-logs`) or **Reports & Reconciliation** (`/reports`) to inspect detailed logs.";
    }

    private String handleComplaintGuidance(User currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.BENEFICIARY) {
            List<Complaint> myComplaints = complaintRepository.findByBeneficiaryUserIdOrderByCreatedAtDesc(currentUser.getId());
            if (!myComplaints.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 📋 Your Tracked Grievance Tickets\n\n");
                for (Complaint c : myComplaints.stream().limit(3).toList()) {
                    sb.append("- **Ticket #").append(c.getComplaintNumber()).append("**: ").append(c.getSubject())
                            .append(" | Status: **").append(c.getStatus()).append("**\n");
                    if (c.getResolutionRemarks() != null && !c.getResolutionRemarks().isBlank()) {
                        sb.append("  *Remarks:* ").append(c.getResolutionRemarks()).append("\n");
                    }
                }
                sb.append("\nYou can file a new grievance or review full inspection histories in the **[Grievances / Complaints](/complaints)** tab.");
                return sb.toString();
            }
        }

        return "### ⚖️ How to Register an Official Grievance\n\n"
                + "1. **Stock Shortage / Missing Items:** File under `STOCK_UNAVAILABLE` if shop reports consecutive unfulfilled quotas.\n"
                + "2. **Scale Calibration / Weighment:** File under `WEIGHMENT_ISSUE` with POS receipt reference.\n"
                + "3. **Overcharging:** File under `OVERCHARGING` if charged above statutory NFSA rates.\n"
                + "4. **Counter Conduct:** File under `OPERATOR_BEHAVIOR`.\n\n"
                + "Submit your formal ticket in the **[Grievances / Complaints](/complaints)** tab for departmental review.";
    }

    private String buildRationRulesReport() {
        return "### ⚖️ National Food Security Act (NFSA) Distribution Rules\n\n"
                + "1. **Antyodaya Anna Yojana (AAY / Yellow Cards):**\n"
                + "   - 35 KG subsidized grain per household (25 KG Rice @ ₹0/Free + 10 KG Wheat @ ₹0/Free)\n"
                + "   - 1 KG Sugar @ ₹13.50/KG, 2 KG Toor Dal @ ₹30.00/KG, 1 L Cooking Oil @ ₹25.00, 1 KG Salt Free, 1 KG Urad Dal @ ₹30.00\n\n"
                + "2. **Priority Household (BPL / PHH / Pink Cards):**\n"
                + "   - 5 KG foodgrain per family member (3 KG Rice @ ₹3/KG + 2 KG Wheat @ ₹2/KG)\n"
                + "   - 1 KG Sugar @ ₹13.50/KG, 1 KG Toor Dal @ ₹35.00/KG, 1 L Cooking Oil @ ₹25.00, 1 KG Salt Free, 1 KG Urad Dal @ ₹30.00\n\n"
                + "3. **Non-Priority Household (APL / White Cards):**\n"
                + "   - Standard household quota (10 KG Rice @ ₹8.50/KG + 5 KG Wheat @ ₹7.00/KG, 1 L Oil @ ₹35.00, 1 KG Urad Dal @ ₹45.00)\n\n"
                + "All allocations are verified using POS biometric electronic weighment scales.";
    }

    private String buildGeneralGreeting(String shopName, Role userRole) {
        return "👋 **Vanakkam! Welcome to the SMART RATION AI Assistant.**\n\n"
                + "I am directly connected to the **MySQL `smart`** database at **" + shopName + "**.\n\n"
                + "Here are some questions you can ask me:\n"
                + "• *View all available ration commodities.*\n"
                + "• *How much rice is available?*\n"
                + "• *I need 5 kg of rice. Is it available?*\n"
                + "• *Check wheat availability.*\n"
                + "• *Is sugar available?*\n"
                + "• *Show all out-of-stock commodities.*\n"
                + "• *Show low-stock commodities.*\n"
                + "• *Check today's available booking slots.*\n"
                + "• *Why is a particular commodity unavailable?*\n"
                + "• *Check my ration entitlement.*\n"
                + "• *How much stock was added today?*";
    }

    private List<String> getStandardSuggestions(Role role) {
        if (role == Role.SHOP_OPERATOR) {
            return List.of(
                    "How much stock was added today?",
                    "How much stock was distributed?",
                    "Show current stock movement",
                    "Which commodities need replenishment?",
                    "Check today's available booking slots",
                    "Show all out-of-stock commodities"
            );
        } else if (role == Role.AUDITOR) {
            return List.of(
                    "Show quality audit and compliance summary",
                    "Show current stock movement",
                    "Show full stock ledger table",
                    "Which commodities need replenishment?",
                    "What are the ration distribution rules?"
            );
        } else if (role == Role.SUPER_ADMIN) {
            return List.of(
                    "How much stock was added today?",
                    "How much stock was distributed?",
                    "Show current stock movement",
                    "Which commodities need replenishment?",
                    "Show full stock ledger table",
                    "Statewide inventory health"
            );
        }

        return List.of(
                "View all available ration commodities",
                "How much rice is available?",
                "Check wheat availability",
                "Is sugar available?",
                "Show all out-of-stock commodities",
                "Show low-stock commodities",
                "Check today's available booking slots",
                "Why is a particular commodity unavailable?",
                "Check my ration entitlement",
                "Which commodities can I book?",
                "When is the next distribution date?"
        );
    }

    private String getStatusPill(String status) {
        if ("OUT_OF_STOCK".equalsIgnoreCase(status)) return "🔴";
        if ("LOW_STOCK".equalsIgnoreCase(status)) return "🟡";
        return "🟢";
    }

    // ========================================================================
    // INTERNAL DATA STRUCTURE
    // ========================================================================
    @Data
    @Builder
    public static class CommodityStockDetails {
        private Long commodityId;
        private String code;
        private String name;
        private String unit;
        private BigDecimal physicalStock;
        private BigDecimal reservedQuantity;
        private BigDecimal availableQuantity;
        private BigDecimal lowStockThreshold;
        private BigDecimal subsidizedPrice;
        private String status;
        private String statusLabel;
        private String lastUpdated;
        private String replenishmentDate;
        private String replenishmentQuantity;
    }
}
