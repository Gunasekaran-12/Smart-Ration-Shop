-- =========================================================================
-- V6__commodities_stock_enhancement.sql
-- Smart Ration Shop Management System:
-- Standardize 6 Primary Commodities & Seed Consistent Realistic Stock Balances
-- 1. Boiled Rice (Grade A) - In Stock
-- 2. Whole Milling Wheat - In Stock
-- 3. Refined Cane Sugar - Out of Stock (0 kg, replenishment pending)
-- 4. Toor Dal (Split Pigeon Peas) - In Stock
-- 5. Cooking Oil - Low Stock (25 L / 50 L threshold)
-- 6. Fortified Iodized Salt - In Stock
-- =========================================================================

-- 1. Ensure all 6 target commodities exist
INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(1, 'RICE', 'Boiled Rice (Grade A)', 'KG', 3.00, 200.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(2, 'WHEAT', 'Whole Milling Wheat', 'KG', 2.00, 150.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(3, 'SUGAR', 'Refined Cane Sugar', 'KG', 13.50, 50.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(4, 'DAL', 'Toor Dal (Split Pigeon Peas)', 'KG', 35.00, 40.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(6, 'OIL', 'Cooking Oil', 'LITRE', 25.00, 50.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(7, 'SALT', 'Fortified Iodized Salt', 'KG', 0.00, 50.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), measurement_unit = VALUES(measurement_unit), subsidized_price = VALUES(subsidized_price), low_stock_threshold = VALUES(low_stock_threshold), is_active = TRUE;

-- 2. Entitlement Rules for Cooking Oil and Salt
INSERT INTO entitlement_rules (card_category, commodity_id, calculation_type, base_quantity, max_quantity, price_per_unit, effective_from, is_active)
VALUES
('AAY', 6, 'FIXED_PER_CARD', 1.00, 1.00, 25.00, '2026-01-01', TRUE),
('BPL', 6, 'FIXED_PER_CARD', 1.00, 1.00, 25.00, '2026-01-01', TRUE),
('APL', 6, 'FIXED_PER_CARD', 1.00, 1.00, 35.00, '2026-01-01', TRUE),
('AAY', 7, 'FIXED_PER_CARD', 1.00, 1.00, 0.00, '2026-01-01', TRUE),
('BPL', 7, 'FIXED_PER_CARD', 1.00, 1.00, 0.00, '2026-01-01', TRUE),
('APL', 7, 'FIXED_PER_CARD', 1.00, 1.00, 2.00, '2026-01-01', TRUE)
ON DUPLICATE KEY UPDATE base_quantity = VALUES(base_quantity), max_quantity = VALUES(max_quantity), price_per_unit = VALUES(price_per_unit);

-- 3. Seed / Update Stock Batches for Shop 1 (FPS-1001)
-- Rice (ID 1): 950.00 KG available (In Stock)
UPDATE stock_batches SET available_quantity = 950.00, initial_quantity = 1200.00 WHERE shop_id = 1 AND commodity_id = 1;

-- Wheat (ID 2): 680.00 KG available (In Stock)
UPDATE stock_batches SET available_quantity = 680.00, initial_quantity = 800.00 WHERE shop_id = 1 AND commodity_id = 2;

-- Sugar (ID 3): 0.00 KG available (Out of Stock example with expected replenishment)
UPDATE stock_batches SET available_quantity = 0.00, initial_quantity = 150.00 WHERE shop_id = 1 AND commodity_id = 3;

-- Toor Dal (ID 4): 80.00 KG available (In Stock)
UPDATE stock_batches SET available_quantity = 80.00, initial_quantity = 100.00 WHERE shop_id = 1 AND commodity_id = 4;

-- Cooking Oil (ID 6): 25.00 LITRE available (Low Stock example, below 50.00 L threshold)
INSERT INTO stock_batches (id, shop_id, commodity_id, batch_number, warehouse_ref, received_date, initial_quantity, available_quantity, created_by_user_id)
VALUES (8, 1, 6, 'BATCH-2026-OIL-01', 'KSC-WH-BLR-403', '2026-10-05', 100.00, 25.00, 2)
ON DUPLICATE KEY UPDATE available_quantity = 25.00, initial_quantity = 100.00;

-- Fortified Salt (ID 7): 450.00 KG available (In Stock)
INSERT INTO stock_batches (id, shop_id, commodity_id, batch_number, warehouse_ref, received_date, initial_quantity, available_quantity, created_by_user_id)
VALUES (9, 1, 7, 'BATCH-2026-SALT-01', 'KSC-WH-BLR-404', '2026-10-05', 500.00, 450.00, 2)
ON DUPLICATE KEY UPDATE available_quantity = 450.00, initial_quantity = 500.00;

