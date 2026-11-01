package com.smartration.service;

import com.smartration.dto.CommodityRequest;
import com.smartration.entity.Commodity;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.CommodityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommodityService {

    private final CommodityRepository commodityRepository;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<Commodity> getAllCommodities() {
        return commodityRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Commodity> getActiveCommodities() {
        return commodityRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Commodity getCommodityById(Long id) {
        return commodityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commodity not found with ID: " + id));
    }

    @Transactional
    public Commodity createCommodity(CommodityRequest req, String ipAddress) {
        if (commodityRepository.existsByCode(req.getCode().toUpperCase())) {
            throw new BadRequestException("Commodity with code " + req.getCode() + " already exists");
        }

        Commodity commodity = Commodity.builder()
                .code(req.getCode().toUpperCase())
                .name(req.getName())
                .measurementUnit(req.getMeasurementUnit().toUpperCase())
                .subsidizedPrice(req.getSubsidizedPrice())
                .lowStockThreshold(req.getLowStockThreshold())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        Commodity saved = commodityRepository.save(commodity);
        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "CREATE_COMMODITY", "COMMODITY",
                saved.getId().toString(), null, "Created commodity " + saved.getName(), ipAddress);

        return saved;
    }

    @Transactional
    public Commodity updateCommodity(Long id, CommodityRequest req, String ipAddress) {
        Commodity existing = getCommodityById(id);
        existing.setName(req.getName());
        existing.setMeasurementUnit(req.getMeasurementUnit().toUpperCase());
        existing.setSubsidizedPrice(req.getSubsidizedPrice());
        existing.setLowStockThreshold(req.getLowStockThreshold());
        if (req.getIsActive() != null) {
            existing.setIsActive(req.getIsActive());
        }

        Commodity updated = commodityRepository.save(existing);
        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "UPDATE_COMMODITY", "COMMODITY",
                updated.getId().toString(), null, "Updated commodity " + updated.getName(), ipAddress);

        return updated;
    }
}
