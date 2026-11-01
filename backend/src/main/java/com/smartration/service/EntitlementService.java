package com.smartration.service;

import com.smartration.dto.CardEntitlementDto;
import com.smartration.dto.EntitlementRuleRequest;
import com.smartration.entity.Commodity;
import com.smartration.entity.EntitlementRule;
import com.smartration.entity.MonthlyEntitlement;
import com.smartration.entity.RationCard;
import com.smartration.entity.enums.CalculationType;
import com.smartration.entity.enums.CardCategory;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.CommodityRepository;
import com.smartration.repository.EntitlementRuleRepository;
import com.smartration.repository.MonthlyEntitlementRepository;
import com.smartration.repository.StockBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EntitlementService {

    private final EntitlementRuleRepository ruleRepository;
    private final MonthlyEntitlementRepository monthlyEntitlementRepository;
    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public String getCurrentEntitlementMonth() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }

    @Transactional(readOnly = true)
    public List<EntitlementRule> getAllRules() {
        return ruleRepository.findAll();
    }

    @Transactional
    public EntitlementRule saveRule(EntitlementRuleRequest req, String ipAddress) {
        Commodity commodity = commodityRepository.findById(req.getCommodityId())
                .orElseThrow(() -> new ResourceNotFoundException("Commodity not found with ID: " + req.getCommodityId()));

        EntitlementRule rule = ruleRepository
                .findByCardCategoryAndCommodityIdAndIsActiveTrue(req.getCardCategory(), req.getCommodityId())
                .orElse(EntitlementRule.builder()
                        .cardCategory(req.getCardCategory())
                        .commodity(commodity)
                        .build());

        rule.setCalculationType(req.getCalculationType());
        rule.setBaseQuantity(req.getBaseQuantity());
        rule.setMaxQuantity(req.getMaxQuantity());
        rule.setPricePerUnit(req.getPricePerUnit());
        rule.setEffectiveFrom(req.getEffectiveFrom() != null ? req.getEffectiveFrom() : LocalDate.now());
        rule.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        EntitlementRule saved = ruleRepository.save(rule);
        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "CONFIGURE_ENTITLEMENT_RULE",
                "ENTITLEMENT_RULE", saved.getId().toString(), null,
                "Configured rule for category " + saved.getCardCategory() + " and commodity " + commodity.getName(), ipAddress);

        return saved;
    }

    @Transactional
    public void initializeMonthlyEntitlementsForCard(RationCard card) {
        String currentMonth = getCurrentEntitlementMonth();
        List<EntitlementRule> rules = ruleRepository.findByCardCategoryAndIsActiveTrue(card.getCardCategory());

        for (EntitlementRule rule : rules) {
            BigDecimal entitledQty = calculateEntitledQuantity(rule, card.getFamilyMemberCount());

            MonthlyEntitlement me = monthlyEntitlementRepository
                    .findByRationCardIdAndCommodityIdAndEntitlementMonth(card.getId(), rule.getCommodity().getId(), currentMonth)
                    .orElse(MonthlyEntitlement.builder()
                            .rationCard(card)
                            .commodity(rule.getCommodity())
                            .entitlementMonth(currentMonth)
                            .distributedQuantity(BigDecimal.ZERO)
                            .build());

            me.setTotalEntitledQuantity(entitledQty);
            BigDecimal remaining = entitledQty.subtract(me.getDistributedQuantity() != null ? me.getDistributedQuantity() : BigDecimal.ZERO);
            me.setRemainingQuantity(remaining.max(BigDecimal.ZERO));
            me.setRule(rule);

            monthlyEntitlementRepository.save(me);
        }
    }

    public BigDecimal calculateEntitledQuantity(EntitlementRule rule, int familyMembers) {
        if (rule.getCalculationType() == CalculationType.FIXED_PER_CARD) {
            return rule.getBaseQuantity();
        } else {
            // PER_MEMBER
            BigDecimal qty = rule.getBaseQuantity().multiply(BigDecimal.valueOf(familyMembers));
            if (rule.getMaxQuantity() != null && qty.compareTo(rule.getMaxQuantity()) > 0) {
                return rule.getMaxQuantity();
            }
            return qty;
        }
    }

    @Transactional
    public List<CardEntitlementDto> getCardEntitlementsForCurrentMonth(RationCard card) {
        String currentMonth = getCurrentEntitlementMonth();
        List<MonthlyEntitlement> entitlements = monthlyEntitlementRepository.findByRationCardIdAndEntitlementMonth(card.getId(), currentMonth);

        // If not initialized yet this month, auto-initialize
        if (entitlements.isEmpty()) {
            initializeMonthlyEntitlementsForCard(card);
            entitlements = monthlyEntitlementRepository.findByRationCardIdAndEntitlementMonth(card.getId(), currentMonth);
        }

        List<CardEntitlementDto> result = new ArrayList<>();
        Long shopId = card.getShop().getId();

        for (MonthlyEntitlement me : entitlements) {
            Commodity comm = me.getCommodity();
            BigDecimal availableStock = stockBatchRepository.getTotalAvailableStock(shopId, comm.getId());

            BigDecimal unitPrice = comm.getSubsidizedPrice();
            if (me.getRule() != null && me.getRule().getPricePerUnit() != null) {
                unitPrice = me.getRule().getPricePerUnit();
            }

            boolean isEligible = card.getIsActive() &&
                    me.getRemainingQuantity().compareTo(BigDecimal.ZERO) > 0 &&
                    availableStock.compareTo(BigDecimal.ZERO) > 0;

            result.add(CardEntitlementDto.builder()
                    .commodityId(comm.getId())
                    .commodityCode(comm.getCode())
                    .commodityName(comm.getName())
                    .measurementUnit(comm.getMeasurementUnit())
                    .unitPrice(unitPrice)
                    .totalEntitledQuantity(me.getTotalEntitledQuantity())
                    .distributedQuantity(me.getDistributedQuantity())
                    .remainingQuantity(me.getRemainingQuantity())
                    .availableShopStock(availableStock)
                    .isEligibleForDistribution(isEligible)
                    .build());
        }

        return result;
    }
}
