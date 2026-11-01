-- V2__seed_demo_data.sql
-- Seed demonstration data for Smart Ration Shop Management System

-- 1. Insert Ration Shops
INSERT INTO ration_shops (id, shop_number, shop_name, district, taluk_block, address, contact_person, contact_phone, is_active) VALUES
(1, 'FPS-1001', 'Gandhi Nagar Fair Price Shop', 'Bengaluru Urban', 'Central Ward', '12, 1st Cross, Gandhi Nagar, Bengaluru - 560009', 'Ramesh Sharma', '+91 98765 43210', TRUE),
(2, 'FPS-1002', 'Subhash Nagar Public Distribution Center', 'Bengaluru Urban', 'North Taluk', '45, Subhash Nagar Main Road, Bengaluru - 560027', 'Priya Deshmukh', '+91 98765 43211', TRUE),
(3, 'FPS-1003', 'Metro East Supply Outlet', 'Bengaluru Urban', 'East Taluk', '88, Outer Ring Road, Mahadevapura, Bengaluru - 560048', 'Anand Rao', '+91 98765 43212', TRUE);

-- 2. Insert Users
-- Passwords:
-- admin / admin123
-- operator / operator123
-- beneficiary / beneficiary123
-- auditor / auditor123
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, shop_id, ration_card_id, is_active) VALUES
(1, 'admin', '$2b$10$GsaWnb0tfvn42owysdK4TuokRtnvc8fG4ElvIDO3zs0ncEUuOHwG2', 'Director Rajesh Verma', 'admin@smartration.gov.in', '+91 91111 00001', 'SUPER_ADMIN', NULL, NULL, TRUE),
(2, 'operator', '$2b$10$z92t2WEU.C53ulFwVb/a1.Q20d9cwiZb/rWR8nxtY8Anlj51ZePp.', 'Ramesh Sharma (Operator)', 'operator@fps1001.gov.in', '+91 98765 43210', 'SHOP_OPERATOR', 1, NULL, TRUE),
(3, 'beneficiary', '$2b$10$wOvyz8Bx3le1.QEi8HkO0Orqo8LFu5r9duGUsbCnwghN79IkRT/FC', 'Suresh Kumar', 'suresh.kumar@example.com', '+91 94444 11223', 'BENEFICIARY', 1, 1, TRUE),
(4, 'auditor', '$2b$10$cdglMPsgoJHiO.LVtYKmhuD3eGxQslSZEAD4ZpAb2PxRxXnl/1eIK', 'Inspector Meenakshi Sundaram', 'auditor@deptsupply.gov.in', '+91 92222 33344', 'AUDITOR', NULL, NULL, TRUE),
(5, 'operator2', '$2b$10$z92t2WEU.C53ulFwVb/a1.Q20d9cwiZb/rWR8nxtY8Anlj51ZePp.', 'Priya Deshmukh (Operator)', 'operator2@fps1002.gov.in', '+91 98765 43211', 'SHOP_OPERATOR', 2, NULL, TRUE);

-- 3. Insert Commodities
INSERT INTO commodities (id, code, name, measurement_unit, subsidized_price, low_stock_threshold, is_active) VALUES
(1, 'RICE', 'Boiled Rice (Grade A)', 'KG', 3.00, 200.00, TRUE),
(2, 'WHEAT', 'Whole Milling Wheat', 'KG', 2.00, 150.00, TRUE),
(3, 'SUGAR', 'Refined Cane Sugar', 'KG', 13.50, 50.00, TRUE),
(4, 'DAL', 'Toor Dal (Split Pigeon Peas)', 'KG', 35.00, 40.00, TRUE),
(5, 'KEROSENE', 'Subsidized Kerosene', 'LITRE', 25.00, 30.00, TRUE);

-- 4. Insert Configurable Entitlement Rules
-- Categories: AAY (Antyodaya Anna Yojana), BPL (Below Poverty Line), APL (Above Poverty Line)
INSERT INTO entitlement_rules (id, card_category, commodity_id, calculation_type, base_quantity, max_quantity, price_per_unit, effective_from, is_active) VALUES
-- AAY: Fixed 35kg grain (20kg Rice + 15kg Wheat), 1kg Sugar, 1kg Dal
(1, 'AAY', 1, 'FIXED_PER_CARD', 25.00, 25.00, 1.00, '2026-01-01', TRUE),
(2, 'AAY', 2, 'FIXED_PER_CARD', 10.00, 10.00, 1.00, '2026-01-01', TRUE),
(3, 'AAY', 3, 'FIXED_PER_CARD', 1.00, 1.00, 13.50, '2026-01-01', TRUE),
(4, 'AAY', 4, 'FIXED_PER_CARD', 2.00, 2.00, 30.00, '2026-01-01', TRUE),
-- BPL / PHH: 5kg per family member (3kg Rice + 2kg Wheat per member), 1kg Sugar, 1kg Dal
(5, 'BPL', 1, 'PER_MEMBER', 3.00, 30.00, 3.00, '2026-01-01', TRUE),
(6, 'BPL', 2, 'PER_MEMBER', 2.00, 20.00, 2.00, '2026-01-01', TRUE),
(7, 'BPL', 3, 'FIXED_PER_CARD', 1.00, 1.00, 13.50, '2026-01-01', TRUE),
(8, 'BPL', 4, 'FIXED_PER_CARD', 1.00, 2.00, 35.00, '2026-01-01', TRUE),
-- APL: Subsidized rate, limited quota (10kg Rice, 5kg Wheat)
(9, 'APL', 1, 'FIXED_PER_CARD', 10.00, 10.00, 8.50, '2026-01-01', TRUE),
(10, 'APL', 2, 'FIXED_PER_CARD', 5.00, 5.00, 7.00, '2026-01-01', TRUE),
(11, 'APL', 3, 'FIXED_PER_CARD', 1.00, 1.00, 20.00, '2026-01-01', TRUE);

-- 5. Insert Ration Cards
INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active) VALUES
(1, 'RC-KA-01-987654', 'Suresh Kumar', 'BPL', 4, 1, 'No. 42, 3rd Cross, Gandhi Nagar, Bengaluru', '+91 94444 11223', TRUE),
(2, 'RC-KA-01-987655', 'Lakshmi Bai', 'AAY', 3, 1, 'No. 15, Slum Board Quarters, Gandhi Nagar, Bengaluru', '+91 94444 22334', TRUE),
(3, 'RC-KA-01-987656', 'Mohammed Rafiq', 'BPL', 5, 1, 'No. 78, Tank Bund Road, Bengaluru', '+91 94444 33445', TRUE),
(4, 'RC-KA-01-987657', 'Sunita Patil', 'APL', 3, 1, 'No. 102, 5th Main, Malleshwaram, Bengaluru', '+91 94444 44556', TRUE),
(5, 'RC-KA-02-123450', 'Anand Hegde', 'BPL', 4, 2, 'No. 22, Subhash Nagar, Bengaluru', '+91 94444 55667', TRUE);

-- 6. Insert Family Members
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(1, 1, 'Suresh Kumar', 'HEAD', 46, 'MALE'),
(2, 1, 'Radha Kumar', 'SPOUSE', 42, 'FEMALE'),
(3, 1, 'Kavya Kumar', 'DAUGHTER', 18, 'FEMALE'),
(4, 1, 'Aditya Kumar', 'SON', 15, 'MALE'),
(5, 2, 'Lakshmi Bai', 'HEAD', 62, 'FEMALE'),
(6, 2, 'Manjunath Bai', 'SON', 35, 'MALE'),
(7, 2, 'Sangeetha Bai', 'DAUGHTER-IN-LAW', 30, 'FEMALE'),
(8, 3, 'Mohammed Rafiq', 'HEAD', 50, 'MALE'),
(9, 3, 'Fatima Begum', 'SPOUSE', 45, 'FEMALE'),
(10, 3, 'Imran Rafiq', 'SON', 22, 'MALE'),
(11, 3, 'Zoya Rafiq', 'DAUGHTER', 19, 'FEMALE'),
(12, 3, 'Tariq Rafiq', 'SON', 14, 'MALE');

-- 7. Insert Stock Batches Received from Central Warehouse
INSERT INTO stock_batches (id, shop_id, commodity_id, batch_number, warehouse_ref, received_date, initial_quantity, available_quantity, created_by_user_id) VALUES
(1, 1, 1, 'BATCH-2026-RICE-01', 'FCI-WH-BLR-892', '2026-10-01', 1200.00, 950.00, 2),
(2, 1, 2, 'BATCH-2026-WHEAT-01', 'FCI-WH-BLR-893', '2026-10-01', 800.00, 680.00, 2),
(3, 1, 3, 'BATCH-2026-SUGAR-01', 'KSC-WH-BLR-401', '2026-10-02', 150.00, 110.00, 2),
(4, 1, 4, 'BATCH-2026-DAL-01', 'KSC-WH-BLR-402', '2026-10-02', 100.00, 80.00, 2),
(5, 1, 5, 'BATCH-2026-KERO-01', 'IOCL-DEPOT-12', '2026-10-03', 100.00, 25.00, 2), -- Low stock alert example!
(6, 2, 1, 'BATCH-2026-RICE-02', 'FCI-WH-BLR-894', '2026-10-04', 1500.00, 1350.00, 5),
(7, 2, 2, 'BATCH-2026-WHEAT-02', 'FCI-WH-BLR-895', '2026-10-04', 900.00, 810.00, 5);

-- 8. Traceable Stock Movements Ledger
INSERT INTO stock_movements (id, shop_id, commodity_id, movement_type, quantity, balance_after, batch_id, reference_id, reason, performed_by_user_id, created_at) VALUES
(1, 1, 1, 'INWARD_RECEIPT', 1200.00, 1200.00, 1, 'FCI-WH-BLR-892', 'Initial October Warehouse Inward Receipt', 2, '2026-10-01 09:30:00'),
(2, 1, 2, 'INWARD_RECEIPT', 800.00, 800.00, 2, 'FCI-WH-BLR-893', 'Initial October Warehouse Inward Receipt', 2, '2026-10-01 09:45:00'),
(3, 1, 3, 'INWARD_RECEIPT', 150.00, 150.00, 3, 'KSC-WH-BLR-401', 'Sugar Consignment from State Civil Supplies', 2, '2026-10-02 10:15:00'),
(4, 1, 4, 'INWARD_RECEIPT', 100.00, 100.00, 4, 'KSC-WH-BLR-402', 'Pulses / Dal Inward Receipt', 2, '2026-10-02 10:30:00'),
(5, 1, 5, 'INWARD_RECEIPT', 100.00, 100.00, 5, 'IOCL-DEPOT-12', 'Kerosene supply from depot', 2, '2026-10-03 11:00:00'),
(6, 1, 1, 'DISTRIBUTION_OUTWARD', -25.00, 1175.00, 1, 'TXN-202610-001', 'Beneficiary Distribution to RC-KA-01-987655', 2, '2026-10-15 11:30:00'),
(7, 1, 2, 'DISTRIBUTION_OUTWARD', -10.00, 790.00, 2, 'TXN-202610-001', 'Beneficiary Distribution to RC-KA-01-987655', 2, '2026-10-15 11:30:00'),
(8, 1, 1, 'ADJUSTMENT_DAMAGE', -5.00, 1170.00, 1, 'ADJ-2026-001', 'Rain moisture bag damage verified during internal shop audit', 2, '2026-10-20 16:00:00');

-- 9. Initialize Current Month Entitlements (2026-10)
-- For Card 1 (BPL, 4 members): Rice 12kg (3*4), Wheat 8kg (2*4), Sugar 1kg, Dal 1kg
INSERT INTO monthly_entitlements (id, ration_card_id, commodity_id, entitlement_month, total_entitled_quantity, distributed_quantity, remaining_quantity, rule_id, created_at) VALUES
(1, 1, 1, '2026-10', 12.00, 0.00, 12.00, 5, '2026-10-01 00:00:00'),
(2, 1, 2, '2026-10', 8.00, 0.00, 8.00, 6, '2026-10-01 00:00:00'),
(3, 1, 3, '2026-10', 1.00, 0.00, 1.00, 7, '2026-10-01 00:00:00'),
(4, 1, 4, '2026-10', 1.00, 0.00, 1.00, 8, '2026-10-01 00:00:00'),
-- For Card 2 (AAY): Rice 25kg, Wheat 10kg, Sugar 1kg, Dal 2kg
(5, 2, 1, '2026-10', 25.00, 25.00, 0.00, 1, '2026-10-01 00:00:00'),
(6, 2, 2, '2026-10', 10.00, 10.00, 0.00, 2, '2026-10-01 00:00:00'),
(7, 2, 3, '2026-10', 1.00, 0.00, 1.00, 3, '2026-10-01 00:00:00'),
(8, 2, 4, '2026-10', 2.00, 0.00, 2.00, 4, '2026-10-01 00:00:00'),
-- For Card 3 (BPL, 5 members): Rice 15kg, Wheat 10kg, Sugar 1kg, Dal 1kg
(9, 3, 1, '2026-10', 15.00, 0.00, 15.00, 5, '2026-10-01 00:00:00'),
(10, 3, 2, '2026-10', 10.00, 0.00, 10.00, 6, '2026-10-01 00:00:00'),
(11, 3, 3, '2026-10', 1.00, 0.00, 1.00, 7, '2026-10-01 00:00:00'),
(12, 3, 4, '2026-10', 1.00, 0.00, 1.00, 8, '2026-10-01 00:00:00'),
-- For Card 4 (APL): Rice 10kg, Wheat 5kg, Sugar 1kg
(13, 4, 1, '2026-10', 10.00, 0.00, 10.00, 9, '2026-10-01 00:00:00'),
(14, 4, 2, '2026-10', 5.00, 0.00, 5.00, 10, '2026-10-01 00:00:00'),
(15, 4, 3, '2026-10', 1.00, 0.00, 1.00, 11, '2026-10-01 00:00:00');

-- 10. Historical Distributions & Receipts
INSERT INTO distributions (id, transaction_reference, idempotency_key, ration_card_id, shop_id, distributed_by_user_id, distribution_date, total_amount, status, receipt_notes) VALUES
(1, 'TXN-202610-001', 'idemp-seed-001', 2, 1, 2, '2026-10-15 11:30:00', 35.00, 'COMPLETED', 'Regular Monthly Distribution for Cardholder Lakshmi Bai');

INSERT INTO distribution_items (id, distribution_id, commodity_id, quantity, unit_price, total_price, stock_batch_id) VALUES
(1, 1, 1, 25.00, 1.00, 25.00, 1),
(2, 1, 2, 10.00, 1.00, 10.00, 2);

-- 11. Complaints
INSERT INTO complaints (id, complaint_number, ration_card_id, beneficiary_user_id, shop_id, category, subject, description, status, resolution_remarks, resolved_by_user_id, resolved_at) VALUES
(1, 'CMP-2026-0001', 1, 3, 1, 'WEIGHMENT_ISSUE', 'Electronic scale calibration check requested', 'Requesting verification of the electronic weighing scale accuracy at FPS-1001 counter.', 'RESOLVED', 'Weights & Measures inspector inspected and stamped scale on Oct 18.', 4, '2026-10-18 14:00:00'),
(2, 'CMP-2026-0002', 1, 3, 1, 'STOCK_UNAVAILABLE', 'Dal availability enquiry', 'When will the new consignment of Toor Dal be open for collection this week?', 'IN_REVIEW', NULL, NULL, NULL);

-- 12. Notifications
INSERT INTO notifications (id, target_user_id, target_role, target_shop_id, title, message, notification_type, is_read, created_at) VALUES
(1, NULL, 'SHOP_OPERATOR', 1, 'Low Stock Alert: Kerosene', 'Subsidized Kerosene stock (25.00 Litres) is below the threshold of 30.00 Litres.', 'LOW_STOCK', FALSE, '2026-10-25 09:00:00'),
(2, 3, 'BENEFICIARY', 1, 'Monthly Entitlements Ready', 'Your family quota for October 2026 is available for collection at FPS-1001.', 'SYSTEM', FALSE, '2026-10-01 08:00:00'),
(3, NULL, 'SUPER_ADMIN', NULL, 'Monthly Reconciliation Required', 'Departmental audit scheduled for all Bengaluru Urban outlets.', 'SYSTEM', FALSE, '2026-10-20 10:00:00');

-- 13. Audit Logs
INSERT INTO audit_logs (id, user_id, username, user_role, action, entity_type, entity_id, shop_id, details, ip_address, created_at) VALUES
(1, 1, 'admin', 'SUPER_ADMIN', 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', NULL, 'Initial system deployment and fair price shop registrations.', '127.0.0.1', '2026-10-01 08:00:00'),
(2, 2, 'operator', 'SHOP_OPERATOR', 'STOCK_INWARD_RECEIPT', 'STOCK_BATCH', 'BATCH-2026-RICE-01', 1, 'Received 1200.00 KG Rice from warehouse ref FCI-WH-BLR-892', '192.168.1.10', '2026-10-01 09:30:00'),
(3, 2, 'operator', 'SHOP_OPERATOR', 'COMMODITY_DISTRIBUTION', 'DISTRIBUTION', 'TXN-202610-001', 1, 'Distributed 25kg Rice and 10kg Wheat to Card RC-KA-01-987655', '192.168.1.10', '2026-10-15 11:30:00'),
(4, 2, 'operator', 'SHOP_OPERATOR', 'STOCK_ADJUSTMENT', 'STOCK_MOVEMENT', 'ADJ-2026-001', 1, 'Stock adjustment -5.00 KG Rice due to moisture damage', '192.168.1.10', '2026-10-20 16:00:00');
