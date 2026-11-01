-- =========================================================================
-- V4__beneficiary_dob_seed.sql
-- Seed verified Date of Birth for beneficiary initial password authentication
-- Initial statutory password convention:
-- First 4 letters of Head of Family (UPPERCASE) + 4-digit Birth Year
-- e.g., 'Suresh Kumar' (1982-05-14) -> 'SURE1982'
-- e.g., 'Ramesh Sharma' (1982-05-14) -> 'RAME1982'
-- =========================================================================

-- 1. Ensure all seeded ration cards have official Date of Birth
UPDATE ration_cards SET date_of_birth = '1982-05-14' WHERE card_number = 'RC-KA-01-987654';
UPDATE ration_cards SET date_of_birth = '1964-08-25' WHERE card_number = 'RC-KA-01-987655';
UPDATE ration_cards SET date_of_birth = '1976-12-10' WHERE card_number = 'RC-KA-01-987656';
UPDATE ration_cards SET date_of_birth = '1985-04-18' WHERE card_number = 'RC-KA-01-987657';
UPDATE ration_cards SET date_of_birth = '1980-07-03' WHERE card_number = 'RC-KA-02-123450';

-- 2. Insert demo card for Ramesh Sharma (satisfies RAME1982 example directly)
INSERT IGNORE INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES (6, 'RC-KA-01-456123', 'Ramesh Sharma', 'BPL', 4, 1, 'No. 88, 2nd Main, Gandhi Nagar, Bengaluru', '+91 94444 66778', TRUE, '1982-05-14');

-- 3. Set temporary password flag for initial seed beneficiary user so statutory initial password can authenticate
UPDATE users SET is_temporary_password = TRUE WHERE id = 3;

