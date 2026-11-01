package com.smartration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartration.dto.StockSummaryDto;
import com.smartration.entity.Commodity;
import com.smartration.entity.StockBatch;
import com.smartration.repository.CommodityRepository;
import com.smartration.repository.StockBatchRepository;
import jakarta.annotation.PostConstruct;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryBackupService {

    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockService stockService;

    private static Path resolveDataDir() {
        Path current = Paths.get(".").toAbsolutePath().normalize();
        if (current.getFileName() != null && current.getFileName().toString().equals("backend")) {
            return current.resolve("data");
        }
        if (Files.exists(current.resolve("backend"))) {
            return current.resolve("backend/data");
        }
        return current.resolve("data");
    }

    private final Path dataPath = resolveDataDir();
    private final Path backupPath = dataPath.resolve("backups");
    private final Path snapshotPath = dataPath.resolve("inventory_snapshot.json");

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .enable(SerializationFeature.INDENT_OUTPUT);

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(dataPath);
            Files.createDirectories(backupPath);
            createInventoryBackup("startup");
            log.info("Centralized inventory persistent storage verified at: {}", dataPath.toAbsolutePath());
        } catch (Exception e) {
            log.warn("Failed to initialize persistent backup directory: {}", e.getMessage());
        }
    }

    /**
     * Creates a full inventory snapshot backup in backend/data/
     */
    public synchronized String createInventoryBackup(String triggerReason) {
        try {
            Files.createDirectories(dataPath);
            Files.createDirectories(backupPath);

            List<Commodity> commodities = commodityRepository.findAll();
            List<StockSummaryDto> summaries = stockService.getShopStockSummary(1L);

            InventorySnapshot snapshot = InventorySnapshot.builder()
                    .timestamp(LocalDateTime.now())
                    .triggerReason(triggerReason)
                    .shopId(1L)
                    .commodities(commodities)
                    .stockSummaries(summaries)
                    .build();

            // 1. Write latest snapshot
            File snapshotFile = snapshotPath.toFile();
            objectMapper.writeValue(snapshotFile, snapshot);

            // 2. Also write timestamped backup file in backups/
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            File backupFile = backupPath.resolve("inventory_backup_" + timestamp + ".json").toFile();
            objectMapper.writeValue(backupFile, snapshot);

            log.info("Inventory snapshot created successfully: {} (Trigger: {})", snapshotFile.getAbsolutePath(), triggerReason);
            return snapshotFile.getAbsolutePath();
        } catch (IOException e) {
            log.error("Failed to write persistent inventory backup: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Automatic hourly backup scheduled job
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledBackup() {
        createInventoryBackup("scheduled_hourly");
    }

    @Data
    @Builder
    public static class InventorySnapshot {
        private LocalDateTime timestamp;
        private String triggerReason;
        private Long shopId;
        private List<Commodity> commodities;
        private List<StockSummaryDto> stockSummaries;
    }
}
