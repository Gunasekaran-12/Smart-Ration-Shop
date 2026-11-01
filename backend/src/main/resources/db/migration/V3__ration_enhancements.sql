-- =========================================================================
-- V3__ration_enhancements.sql
-- Smart Ration Management System Enterprise Enhancements:
-- 1. Beneficiary Authentication & Cardholder DOB
-- 2. Fair Price Shop Operating Status & Timestamps
-- 3. Cryptographic OTP Verification Challenges
-- 4. 30-Minute / 20-Beneficiary Slot Booking System
-- 5. Transaction Lifecycle & Conflict Reconciliation Ledger
-- 6. Power BI SQL Analytical Views
-- =========================================================================

-- 1. Beneficiary Authentication & Cardholder DOB
ALTER TABLE ration_cards ADD COLUMN date_of_birth DATE NULL;
ALTER TABLE users ADD COLUMN is_temporary_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing demo ration cards with known birthdays for beneficiary login testing
-- Derived initial password rule: First 4 letters of Head of Family (UPPERCASE) + Birth Year (YYYY)
-- e.g., 'RAMESH' (1982) -> 'RAME1982'
UPDATE ration_cards SET date_of_birth = '1982-05-14' WHERE card_number = 'RC-KA-01-987654';
UPDATE ration_cards SET date_of_birth = '1978-11-20' WHERE card_number = 'RC-KA-01-456123';
UPDATE ration_cards SET date_of_birth = '1990-03-08' WHERE card_number = 'RC-KA-01-789321';

-- 2. Shop Operating Status & Timestamps
ALTER TABLE ration_shops ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE ration_shops ADD COLUMN last_opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ration_shops ADD COLUMN last_closed_at TIMESTAMP NULL;
ALTER TABLE ration_shops ADD COLUMN operating_hours VARCHAR(100) DEFAULT '09:00 AM - 01:00 PM, 02:00 PM - 06:00 PM';

-- 3. Cryptographic OTP Challenges Table
CREATE TABLE IF NOT EXISTS otp_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(60) NOT NULL UNIQUE,
    ration_card_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    requested_items_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id),
    CONSTRAINT fk_otp_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id)
);

CREATE INDEX idx_otp_card_active ON otp_challenges(ration_card_id, is_consumed);

-- 4. Booking Slots and Ration Bookings Table
CREATE TABLE IF NOT EXISTS booking_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 20,
    booked_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_shop_slot UNIQUE (shop_id, slot_date, start_time),
    CONSTRAINT fk_slot_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id)
);

CREATE TABLE IF NOT EXISTS ration_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(60) NOT NULL UNIQUE,
    ration_card_id BIGINT NOT NULL,
    beneficiary_user_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, COMPLETED, EXPIRED
    cancellation_reason VARCHAR(255),
    reserved_commodities_json TEXT,
    distribution_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id),
    CONSTRAINT fk_booking_user FOREIGN KEY (beneficiary_user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES booking_slots(id),
    CONSTRAINT fk_booking_dist FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE SET NULL
);

CREATE INDEX idx_bookings_card ON ration_bookings(ration_card_id, status);
CREATE INDEX idx_bookings_slot ON ration_bookings(slot_id, status);

-- 5. Transaction Lifecycle & Conflict Reconciliation Ledger
ALTER TABLE distributions ADD COLUMN lifecycle_state VARCHAR(40) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE distributions ADD COLUMN expected_stock_json TEXT NULL;
ALTER TABLE distributions ADD COLUMN actual_stock_json TEXT NULL;

CREATE TABLE IF NOT EXISTS transaction_conflicts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    distribution_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    conflict_type VARCHAR(50) NOT NULL, -- STOCK_UPDATE_FAILURE, DUPLICATE_DISTRIBUTION, EXCESS_ENTITLEMENT, INSUFFICIENT_STOCK, INCOMPLETE_TRANSACTION, STOCK_MISMATCH
    expected_stock DECIMAL(12, 2) NOT NULL,
    actual_stock DECIMAL(12, 2) NOT NULL,
    difference_quantity DECIMAL(12, 2) NOT NULL,
    commodity_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'CONFLICT_DETECTED', -- CONFLICT_DETECTED, RECONCILIATION_REQUIRED, UNDER_VERIFICATION, AUTHORIZED_CORRECTION, RECONCILED, REJECTED
    reported_by_user_id BIGINT NOT NULL,
    resolution_notes TEXT,
    corrected_quantity DECIMAL(12, 2) NULL,
    resolved_by_user_id BIGINT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conflicts_dist FOREIGN KEY (distribution_id) REFERENCES distributions(id),
    CONSTRAINT fk_conflicts_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_conflicts_comm FOREIGN KEY (commodity_id) REFERENCES commodities(id),
    CONSTRAINT fk_conflicts_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_conflicts_resolver FOREIGN KEY (resolved_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_conflicts_status ON transaction_conflicts(status, shop_id);

-- 6. Seed initial 30-minute booking slots for demo shop (id = 1) for the next 14 days
-- 09:00 to 12:00, 14:00 to 17:00 (30-min increments with 20 capacity)
INSERT IGNORE INTO booking_slots (shop_id, slot_date, start_time, end_time, max_capacity, booked_count, is_active)
SELECT 1, CURDATE(), '09:00:00', '09:30:00', 20, 2, TRUE UNION ALL
SELECT 1, CURDATE(), '09:30:00', '10:00:00', 20, 5, TRUE UNION ALL
SELECT 1, CURDATE(), '10:00:00', '10:30:00', 20, 8, TRUE UNION ALL
SELECT 1, CURDATE(), '10:30:00', '11:00:00', 20, 3, TRUE UNION ALL
SELECT 1, CURDATE(), '11:00:00', '11:30:00', 20, 1, TRUE UNION ALL
SELECT 1, CURDATE(), '11:30:00', '12:00:00', 20, 0, TRUE UNION ALL
SELECT 1, CURDATE(), '14:00:00', '14:30:00', 20, 4, TRUE UNION ALL
SELECT 1, CURDATE(), '14:30:00', '15:00:00', 20, 6, TRUE UNION ALL
SELECT 1, CURDATE(), '15:00:00', '15:30:00', 20, 2, TRUE UNION ALL
SELECT 1, CURDATE(), '15:30:00', '16:00:00', 20, 0, TRUE UNION ALL
SELECT 1, CURDATE(), '16:00:00', '16:30:00', 20, 1, TRUE UNION ALL
SELECT 1, CURDATE(), '16:30:00', '17:00:00', 20, 0, TRUE;

-- 7. Power BI Analytical Views (Excluding failed/incomplete records and avoiding duplicate join counts)

-- View 1: Stock Analytics View
CREATE OR REPLACE VIEW vw_stock_analytics AS
SELECT 
    s.id AS shop_id,
    s.shop_number,
    s.shop_name,
    s.district,
    c.id AS commodity_id,
    c.name AS commodity_name,
    c.measurement_unit,
    c.subsidized_price,
    COALESCE(SUM(b.available_quantity), 0.00) AS current_physical_stock,
    c.low_stock_threshold,
    CASE 
        WHEN COALESCE(SUM(b.available_quantity), 0.00) <= 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(SUM(b.available_quantity), 0.00) <= c.low_stock_threshold THEN 'LOW_STOCK'
        ELSE 'ADEQUATE'
    END AS stock_health_status,
    s.is_open AS shop_is_open,
    s.operating_hours
FROM ration_shops s
CROSS JOIN commodities c
LEFT JOIN stock_batches b ON b.shop_id = s.id AND b.commodity_id = c.id
WHERE s.is_active = TRUE AND c.is_active = TRUE
GROUP BY s.id, s.shop_number, s.shop_name, s.district, c.id, c.name, c.measurement_unit, c.subsidized_price, c.low_stock_threshold, s.is_open, s.operating_hours;

-- View 2: Monthly Distribution View
CREATE OR REPLACE VIEW vw_monthly_distribution AS
SELECT 
    d.shop_id,
    s.shop_name,
    s.district,
    DATE_FORMAT(d.distribution_date, '%Y-%m') AS distribution_month,
    di.commodity_id,
    c.name AS commodity_name,
    c.measurement_unit,
    rc.card_category,
    COUNT(DISTINCT d.id) AS total_transactions,
    COUNT(DISTINCT d.ration_card_id) AS distinct_beneficiaries_served,
    SUM(di.quantity) AS total_distributed_quantity,
    SUM(di.total_price) AS total_revenue_collected
FROM distributions d
JOIN ration_shops s ON d.shop_id = s.id
JOIN distribution_items di ON di.distribution_id = d.id
JOIN commodities c ON di.commodity_id = c.id
JOIN ration_cards rc ON d.ration_card_id = rc.id
WHERE d.status = 'COMPLETED' AND d.lifecycle_state = 'COMPLETED'
GROUP BY d.shop_id, s.shop_name, s.district, DATE_FORMAT(d.distribution_date, '%Y-%m'), di.commodity_id, c.name, c.measurement_unit, rc.card_category;

-- View 3: Conflict Analytics View
CREATE OR REPLACE VIEW vw_conflict_analytics AS
SELECT 
    tc.id AS conflict_id,
    tc.shop_id,
    s.shop_name,
    s.district,
    tc.distribution_id,
    tc.conflict_type,
    tc.commodity_id,
    c.name AS commodity_name,
    tc.expected_stock,
    tc.actual_stock,
    tc.difference_quantity,
    tc.status AS conflict_status,
    tc.reported_by_user_id,
    u.username AS reporter_username,
    tc.resolved_by_user_id,
    ru.username AS resolver_username,
    tc.created_at AS detected_at,
    tc.resolved_at
FROM transaction_conflicts tc
JOIN ration_shops s ON tc.shop_id = s.id
JOIN commodities c ON tc.commodity_id = c.id
JOIN users u ON tc.reported_by_user_id = u.id
LEFT JOIN users ru ON tc.resolved_by_user_id = ru.id;

-- View 4: Transaction Lifecycle View
CREATE OR REPLACE VIEW vw_transaction_lifecycle AS
SELECT 
    d.id AS distribution_id,
    d.transaction_reference,
    d.shop_id,
    s.shop_name,
    d.ration_card_id,
    rc.card_number,
    rc.card_category,
    d.lifecycle_state,
    d.status AS overall_status,
    d.distribution_date,
    d.total_amount,
    COUNT(di.id) AS total_item_count
FROM distributions d
JOIN ration_shops s ON d.shop_id = s.id
JOIN ration_cards rc ON d.ration_card_id = rc.id
LEFT JOIN distribution_items di ON di.distribution_id = d.id
GROUP BY d.id, d.transaction_reference, d.shop_id, s.shop_name, d.ration_card_id, rc.card_number, rc.card_category, d.lifecycle_state, d.status, d.distribution_date, d.total_amount;

-- View 5: Entitlement Utilization View
CREATE OR REPLACE VIEW vw_entitlement_utilization AS
SELECT 
    me.entitlement_month,
    rc.shop_id,
    s.shop_name,
    rc.card_category,
    me.commodity_id,
    c.name AS commodity_name,
    COUNT(DISTINCT me.ration_card_id) AS enrolled_households,
    SUM(me.total_entitled_quantity) AS statutory_quota_allocated,
    SUM(me.distributed_quantity) AS quota_distributed,
    SUM(me.remaining_quantity) AS quota_unclaimed,
    ROUND((SUM(me.distributed_quantity) / NULLIF(SUM(me.total_entitled_quantity), 0)) * 100, 2) AS utilization_percentage
FROM monthly_entitlements me
JOIN ration_cards rc ON me.ration_card_id = rc.id
JOIN ration_shops s ON rc.shop_id = s.id
JOIN commodities c ON me.commodity_id = c.id
GROUP BY me.entitlement_month, rc.shop_id, s.shop_name, rc.card_category, me.commodity_id, c.name;

-- View 6: Booking Analytics View
CREATE OR REPLACE VIEW vw_booking_analytics AS
SELECT 
    rb.shop_id,
    s.shop_name,
    s.district,
    rb.booking_date,
    bs.start_time,
    bs.end_time,
    rb.status AS booking_status,
    COUNT(rb.id) AS total_bookings_received,
    COUNT(CASE WHEN rb.status = 'COMPLETED' THEN 1 END) AS attended_distributions,
    COUNT(CASE WHEN rb.status = 'CANCELLED' THEN 1 END) AS cancelled_bookings,
    COUNT(CASE WHEN rb.status = 'CONFIRMED' THEN 1 END) AS pending_slots
FROM ration_bookings rb
JOIN ration_shops s ON rb.shop_id = s.id
JOIN booking_slots bs ON rb.slot_id = bs.id
GROUP BY rb.shop_id, s.shop_name, s.district, rb.booking_date, bs.start_time, bs.end_time, rb.status;

