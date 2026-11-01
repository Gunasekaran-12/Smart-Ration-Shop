-- V1__create_tables.sql
-- Smart Ration Shop Management System Database Schema

-- 1. Ration Shops Table
CREATE TABLE IF NOT EXISTS ration_shops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_number VARCHAR(50) NOT NULL UNIQUE,
    shop_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluk_block VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    shop_id BIGINT NULL,
    ration_card_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id) ON DELETE SET NULL
);

-- 3. Commodities Table
CREATE TABLE IF NOT EXISTS commodities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    measurement_unit VARCHAR(20) NOT NULL,
    subsidized_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    low_stock_threshold DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ration Cards Table
CREATE TABLE IF NOT EXISTS ration_cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_number VARCHAR(50) NOT NULL UNIQUE,
    head_of_family VARCHAR(120) NOT NULL,
    card_category VARCHAR(20) NOT NULL,
    family_member_count INT NOT NULL DEFAULT 1,
    shop_id BIGINT NOT NULL,
    address TEXT,
    phone_number VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cards_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id)
);

-- 5. Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ration_card_id BIGINT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_members_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id) ON DELETE CASCADE
);

-- 6. Configurable Entitlement Rules Table
CREATE TABLE IF NOT EXISTS entitlement_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_category VARCHAR(20) NOT NULL,
    commodity_id BIGINT NOT NULL,
    calculation_type VARCHAR(30) NOT NULL, -- FIXED_PER_CARD, PER_MEMBER
    base_quantity DECIMAL(10, 2) NOT NULL,
    max_quantity DECIMAL(10, 2),
    price_per_unit DECIMAL(10, 2) NOT NULL,
    effective_from DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_rule_cat_comm UNIQUE (card_category, commodity_id),
    CONSTRAINT fk_rules_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id)
);

-- 7. Stock Batches Table
CREATE TABLE IF NOT EXISTS stock_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    commodity_id BIGINT NOT NULL,
    batch_number VARCHAR(60) NOT NULL,
    warehouse_ref VARCHAR(100) NOT NULL,
    received_date DATE NOT NULL,
    initial_quantity DECIMAL(12, 2) NOT NULL,
    available_quantity DECIMAL(12, 2) NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batches_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_batches_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id),
    CONSTRAINT fk_batches_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- 8. Stock Movements / Traceable Ledger Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    commodity_id BIGINT NOT NULL,
    movement_type VARCHAR(30) NOT NULL, -- INWARD_RECEIPT, DISTRIBUTION_OUTWARD, ADJUSTMENT_DAMAGE, ADJUSTMENT_CORRECTION, ADJUSTMENT_TRANSFER
    quantity DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    batch_id BIGINT NULL,
    reference_id VARCHAR(100) NULL,
    reason TEXT,
    performed_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movements_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_movements_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id),
    CONSTRAINT fk_movements_user FOREIGN KEY (performed_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_movements_batch FOREIGN KEY (batch_id) REFERENCES stock_batches(id) ON DELETE SET NULL
);

-- 9. Monthly Entitlements Balance Table
CREATE TABLE IF NOT EXISTS monthly_entitlements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ration_card_id BIGINT NOT NULL,
    commodity_id BIGINT NOT NULL,
    entitlement_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    total_entitled_quantity DECIMAL(10, 2) NOT NULL,
    distributed_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remaining_quantity DECIMAL(10, 2) NOT NULL,
    rule_id BIGINT NULL,
    last_distributed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_card_comm_month UNIQUE (ration_card_id, commodity_id, entitlement_month),
    CONSTRAINT fk_entitlements_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id),
    CONSTRAINT fk_entitlements_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id),
    CONSTRAINT fk_entitlements_rule FOREIGN KEY (rule_id) REFERENCES entitlement_rules(id)
);

-- 10. Distributions Table
CREATE TABLE IF NOT EXISTS distributions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(60) NOT NULL UNIQUE,
    idempotency_key VARCHAR(100) UNIQUE,
    ration_card_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    distributed_by_user_id BIGINT NOT NULL,
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    receipt_notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dist_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id),
    CONSTRAINT fk_dist_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_dist_user FOREIGN KEY (distributed_by_user_id) REFERENCES users(id)
);

-- 11. Distribution Items Table
CREATE TABLE IF NOT EXISTS distribution_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    distribution_id BIGINT NOT NULL,
    commodity_id BIGINT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    stock_batch_id BIGINT NULL,
    CONSTRAINT fk_dist_items_dist FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE CASCADE,
    CONSTRAINT fk_dist_items_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id),
    CONSTRAINT fk_dist_items_batch FOREIGN KEY (stock_batch_id) REFERENCES stock_batches(id) ON DELETE SET NULL
);

-- 12. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_number VARCHAR(50) NOT NULL UNIQUE,
    ration_card_id BIGINT NOT NULL,
    beneficiary_user_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    resolution_remarks TEXT,
    resolved_by_user_id BIGINT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_card FOREIGN KEY (ration_card_id) REFERENCES ration_cards(id),
    CONSTRAINT fk_complaints_user FOREIGN KEY (beneficiary_user_id) REFERENCES users(id),
    CONSTRAINT fk_complaints_shop FOREIGN KEY (shop_id) REFERENCES ration_shops(id),
    CONSTRAINT fk_complaints_resolved_by FOREIGN KEY (resolved_by_user_id) REFERENCES users(id)
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_user_id BIGINT NULL,
    target_role VARCHAR(30) NULL,
    target_shop_id BIGINT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs Table (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(60) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    shop_id BIGINT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_stock_batches_shop_comm ON stock_batches(shop_id, commodity_id);
CREATE INDEX idx_stock_movements_shop_comm ON stock_movements(shop_id, commodity_id);
CREATE INDEX idx_distributions_date ON distributions(distribution_date);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
