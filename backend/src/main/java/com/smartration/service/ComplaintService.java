package com.smartration.service;

import com.smartration.dto.ComplaintRequest;
import com.smartration.dto.ComplaintResponse;
import com.smartration.dto.ComplaintStatusRequest;
import com.smartration.entity.Complaint;
import com.smartration.entity.RationCard;
import com.smartration.entity.RationShop;
import com.smartration.entity.User;
import com.smartration.entity.enums.NotificationType;
import com.smartration.entity.enums.Role;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.ComplaintRepository;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.RationShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final RationCardRepository rationCardRepository;
    private final RationShopRepository shopRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SseService sseService;
    private final AuthService authService;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest req, String ipAddress) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new BadRequestException("User must be authenticated to submit complaints");
        }

        RationCard card;
        if (currentUser.getRole() == Role.BENEFICIARY && currentUser.getRationCardId() != null) {
            card = rationCardRepository.findById(currentUser.getRationCardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Beneficiary ration card not found"));
        } else if (req.getRationCardId() != null) {
            card = rationCardRepository.findById(req.getRationCardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ration card not found with ID: " + req.getRationCardId()));
        } else {
            throw new BadRequestException("Ration card reference is required for complaint submission");
        }

        RationShop shop = card.getShop();
        String complaintNum = "CMP-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Complaint complaint = Complaint.builder()
                .complaintNumber(complaintNum)
                .rationCard(card)
                .beneficiaryUser(currentUser)
                .shop(shop)
                .category(req.getCategory())
                .subject(req.getSubject())
                .description(req.getDescription())
                .build();

        Complaint saved = complaintRepository.save(complaint);

        auditLogService.logAction(currentUser, "SUBMIT_COMPLAINT", "COMPLAINT",
                saved.getComplaintNumber(), shop.getId(), "Beneficiary filed complaint: " + saved.getSubject(), ipAddress);

        // Notify Shop Operator and Dept Officer
        String alert = "New Beneficiary Grievance (" + saved.getComplaintNumber() + ") submitted for " + shop.getShopName();
        notificationService.createNotification(null, "SHOP_OPERATOR", shop.getId(), "New Grievance Filed", alert, NotificationType.COMPLAINT_UPDATE);
        notificationService.createNotification(null, "SUPER_ADMIN", null, "New Grievance Filed", alert, NotificationType.COMPLAINT_UPDATE);

        ComplaintResponse response = mapToResponse(saved);
        sseService.broadcastEvent("COMPLAINT_SUBMITTED", response);

        return response;
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatusRequest req, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User currentUser = authService.getCurrentAuthenticatedUser();
        complaint.setStatus(req.getStatus());
        if (req.getResolutionRemarks() != null) {
            complaint.setResolutionRemarks(req.getResolutionRemarks());
        }
        complaint.setResolvedByUser(currentUser);
        complaint.setResolvedAt(LocalDateTime.now());

        Complaint updated = complaintRepository.save(complaint);

        auditLogService.logAction(currentUser, "UPDATE_COMPLAINT_STATUS", "COMPLAINT",
                updated.getComplaintNumber(), updated.getShop().getId(),
                "Updated status to " + req.getStatus() + ". Remarks: " + req.getResolutionRemarks(), ipAddress);

        // Notify Beneficiary
        String msg = "Your complaint (" + updated.getComplaintNumber() + ") status has been updated to " +
                req.getStatus() + (req.getResolutionRemarks() != null ? ". Remarks: " + req.getResolutionRemarks() : "");
        notificationService.createNotification(updated.getBeneficiaryUser().getId(), "BENEFICIARY",
                updated.getShop().getId(), "Complaint Status Update", msg, NotificationType.COMPLAINT_UPDATE);

        ComplaintResponse response = mapToResponse(updated);
        sseService.broadcastEvent("COMPLAINT_UPDATED", response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) return List.of();

        return complaintRepository.findByBeneficiaryUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getShopComplaints(Long shopId, Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser != null && currentUser.getRole() == Role.SHOP_OPERATOR && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }
        if (shopId == null) shopId = 1L;

        return complaintRepository.findByShopIdOrderByCreatedAtDesc(shopId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .rationCardId(c.getRationCard().getId())
                .cardNumber(c.getRationCard().getCardNumber())
                .beneficiaryName(c.getBeneficiaryUser() != null ? c.getBeneficiaryUser().getFullName() : c.getRationCard().getHeadOfFamily())
                .shopId(c.getShop().getId())
                .shopName(c.getShop().getShopName())
                .category(c.getCategory())
                .subject(c.getSubject())
                .description(c.getDescription())
                .status(c.getStatus())
                .resolutionRemarks(c.getResolutionRemarks())
                .resolvedBy(c.getResolvedByUser() != null ? c.getResolvedByUser().getFullName() : null)
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
