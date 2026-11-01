package com.smartration.service;

import com.smartration.dto.FamilyMemberDto;
import com.smartration.dto.RationCardRequest;
import com.smartration.dto.RationCardResponse;
import com.smartration.entity.FamilyMember;
import com.smartration.entity.RationCard;
import com.smartration.entity.RationShop;
import com.smartration.entity.User;
import com.smartration.entity.enums.CardCategory;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.FamilyMemberRepository;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.RationShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RationCardService {

    private final RationCardRepository rationCardRepository;
    private final RationShopRepository shopRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final EntitlementService entitlementService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public Page<RationCardResponse> searchCards(Long shopId, CardCategory category, String query, Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        // Operators can only view cards assigned to their shop
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        return rationCardRepository.searchCards(shopId, category, query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public RationCardResponse getCardById(Long id) {
        RationCard card = rationCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Card not found with ID: " + id));
        validateAccess(card);
        return mapToResponse(card);
    }

    @Transactional(readOnly = true)
    public RationCardResponse getCardByNumber(String cardNumber) {
        RationCard card = rationCardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Card not found with number: " + cardNumber));
        validateAccess(card);
        return mapToResponse(card);
    }

    @Transactional
    public RationCardResponse createCard(RationCardRequest req, String ipAddress) {
        if (rationCardRepository.existsByCardNumber(req.getCardNumber())) {
            throw new BadRequestException("Ration card number already exists: " + req.getCardNumber());
        }

        User currentUser = authService.getCurrentAuthenticatedUser();
        Long shopId = req.getShopId();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        if (shopId == null) {
            throw new BadRequestException("Assigned ration shop is required");
        }

        final Long targetShopId = shopId;
        RationShop shop = shopRepository.findById(targetShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found with ID: " + targetShopId));

        int memberCount = (req.getFamilyMembers() != null && !req.getFamilyMembers().isEmpty())
                ? req.getFamilyMembers().size() : 1;

        RationCard card = RationCard.builder()
                .cardNumber(req.getCardNumber().toUpperCase().trim())
                .headOfFamily(req.getHeadOfFamily())
                .dateOfBirth(req.getDateOfBirth())
                .cardCategory(req.getCardCategory())
                .familyMemberCount(memberCount)
                .shop(shop)
                .address(req.getAddress())
                .phoneNumber(req.getPhoneNumber())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .familyMembers(new ArrayList<>())
                .build();

        if (req.getFamilyMembers() != null && !req.getFamilyMembers().isEmpty()) {
            for (FamilyMemberDto memberDto : req.getFamilyMembers()) {
                FamilyMember member = FamilyMember.builder()
                        .rationCard(card)
                        .fullName(memberDto.getFullName())
                        .relationship(memberDto.getRelationship())
                        .age(memberDto.getAge())
                        .gender(memberDto.getGender())
                        .build();
                card.getFamilyMembers().add(member);
            }
            card.setFamilyMemberCount(card.getFamilyMembers().size());
        }

        RationCard saved = rationCardRepository.save(card);

        // Auto-generate current monthly entitlements for this new card based on configured rules
        entitlementService.initializeMonthlyEntitlementsForCard(saved);

        auditLogService.logAction(currentUser, "CREATE_RATION_CARD", "RATION_CARD",
                saved.getId().toString(), shop.getId(), "Created card: " + saved.getCardNumber(), ipAddress);

        return mapToResponse(saved);
    }

    @Transactional
    public RationCardResponse updateCard(Long id, RationCardRequest req, String ipAddress) {
        RationCard card = rationCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Card not found with ID: " + id));
        validateAccess(card);

        User currentUser = authService.getCurrentAuthenticatedUser();

        card.setHeadOfFamily(req.getHeadOfFamily());
        if (req.getDateOfBirth() != null) {
            card.setDateOfBirth(req.getDateOfBirth());
        }
        card.setCardCategory(req.getCardCategory());
        card.setAddress(req.getAddress());
        card.setPhoneNumber(req.getPhoneNumber());
        if (req.getIsActive() != null) {
            card.setIsActive(req.getIsActive());
        }

        // Update family members if provided
        if (req.getFamilyMembers() != null) {
            card.getFamilyMembers().clear();
            for (FamilyMemberDto memberDto : req.getFamilyMembers()) {
                FamilyMember member = FamilyMember.builder()
                        .rationCard(card)
                        .fullName(memberDto.getFullName())
                        .relationship(memberDto.getRelationship())
                        .age(memberDto.getAge())
                        .gender(memberDto.getGender())
                        .build();
                card.getFamilyMembers().add(member);
            }
            card.setFamilyMemberCount(card.getFamilyMembers().size());
        }

        RationCard updated = rationCardRepository.save(card);
        // Refresh entitlements with updated family count / category
        entitlementService.initializeMonthlyEntitlementsForCard(updated);

        auditLogService.logAction(currentUser, "UPDATE_RATION_CARD", "RATION_CARD",
                updated.getId().toString(), updated.getShop().getId(), "Updated card: " + updated.getCardNumber(), ipAddress);

        return mapToResponse(updated);
    }

    @Transactional
    public RationCardResponse toggleCardStatus(Long id, String ipAddress) {
        RationCard card = rationCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Card not found with ID: " + id));
        validateAccess(card);

        User currentUser = authService.getCurrentAuthenticatedUser();
        boolean newStatus = !Boolean.TRUE.equals(card.getIsActive());
        card.setIsActive(newStatus);
        RationCard updated = rationCardRepository.save(card);

        auditLogService.logAction(currentUser, "TOGGLE_RATION_CARD_STATUS", "RATION_CARD",
                updated.getId().toString(), updated.getShop().getId(),
                "Changed status of card " + updated.getCardNumber() + " to " + (newStatus ? "ACTIVE" : "INACTIVE"), ipAddress);

        return mapToResponse(updated);
    }

    private void validateAccess(RationCard card) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) return;

        if (currentUser.getRole() == Role.SHOP_OPERATOR) {
            if (currentUser.getShop() == null || !currentUser.getShop().getId().equals(card.getShop().getId())) {
                throw new BadRequestException("You are not authorized to view or manage cards outside your assigned shop.");
            }
        } else if (currentUser.getRole() == Role.BENEFICIARY) {
            if (currentUser.getRationCardId() == null || !currentUser.getRationCardId().equals(card.getId())) {
                throw new BadRequestException("You can only access your own ration card details.");
            }
        }
    }

    public RationCardResponse mapToResponse(RationCard c) {
        List<FamilyMemberDto> members = c.getFamilyMembers() != null ? c.getFamilyMembers().stream()
                .map(m -> FamilyMemberDto.builder()
                        .id(m.getId())
                        .fullName(m.getFullName())
                        .relationship(m.getRelationship())
                        .age(m.getAge())
                        .gender(m.getGender())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return RationCardResponse.builder()
                .id(c.getId())
                .cardNumber(c.getCardNumber())
                .headOfFamily(c.getHeadOfFamily())
                .dateOfBirth(c.getDateOfBirth())
                .cardCategory(c.getCardCategory())
                .familyMemberCount(c.getFamilyMemberCount())
                .shopId(c.getShop().getId())
                .shopNumber(c.getShop().getShopNumber())
                .shopName(c.getShop().getShopName())
                .address(c.getAddress())
                .phoneNumber(c.getPhoneNumber())
                .isActive(c.getIsActive())
                .familyMembers(members)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
