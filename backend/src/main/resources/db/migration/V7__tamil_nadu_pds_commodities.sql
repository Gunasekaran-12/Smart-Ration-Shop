-- =========================================================================
-- V7__tamil_nadu_pds_commodities.sql
-- Expand PDS inventory with common Tamil Nadu PDS commodities:
-- Urad Dal (Black Gram / உளுத்தம் பருப்பு)
-- =========================================================================

-- 1. Ensure Urad Dal exists
INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active)
VALUES
(8, 'URAD_DAL', 'Urad Dal (Split Black Gram)', 'KG', 30.00, 50.00, TRUE)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    measurement_unit = VALUES(measurement_unit), 
    subsidized_price = VALUES(subsidized_price), 
    low_stock_threshold = VALUES(low_stock_threshold), 
    is_active = TRUE;

-- 2. Entitlement Rules for Urad Dal (1 KG per card per month for AAY/BPL)
INSERT INTO entitlement_rules (card_category, commodity_id, calculation_type, base_quantity, max_quantity, price_per_unit, effective_from, is_active)
VALUES
('AAY', 8, 'FIXED_PER_CARD', 1.00, 1.00, 30.00, '2026-01-01', TRUE),
('BPL', 8, 'FIXED_PER_CARD', 1.00, 1.00, 30.00, '2026-01-01', TRUE),
('APL', 8, 'FIXED_PER_CARD', 1.00, 1.00, 45.00, '2026-01-01', TRUE)
ON DUPLICATE KEY UPDATE 
    base_quantity = VALUES(base_quantity), 
    max_quantity = VALUES(max_quantity), 
    price_per_unit = VALUES(price_per_unit);

-- 3. Seed initial batch for Shop 1 (FPS-1001) - 150.00 KG available
INSERT INTO stock_batches (id, shop_id, commodity_id, batch_number, warehouse_ref, received_date, initial_quantity, available_quantity, created_by_user_id)
VALUES (10, 1, 8, 'BATCH-2026-URAD-01', 'TNCSC-WH-CHN-201', '2026-10-10', 200.00, 150.00, 2)
ON DUPLICATE KEY UPDATE available_quantity = 150.00, initial_quantity = 200.00;

