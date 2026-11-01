-- =========================================================================
-- V5__seed_6_cards_30_members.sql
-- Seed exactly 6 demo ration cards with 5 registered family members each
-- (Total 30 beneficiary records) and statutory initial password credentials.
-- Initial Password statutory rule:
-- First 4 letters of Head of Family (UPPERCASE) + 4-digit Birth Year
-- =========================================================================

-- 1. Ensure all 6 demo ration cards exist with family_member_count = 5 and verified DOBs
INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(1, 'RC-KA-01-987654', 'Suresh Kumar', 'BPL', 5, 1, 'No. 42, 3rd Cross, Gandhi Nagar, Bengaluru', '+91 94444 11223', TRUE, '1982-05-14')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(2, 'RC-KA-01-987655', 'Lakshmi Bai', 'AAY', 5, 1, 'No. 15, Slum Board Quarters, Gandhi Nagar, Bengaluru', '+91 94444 22334', TRUE, '1964-08-25')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(3, 'RC-KA-01-987656', 'Mohammed Rafiq', 'BPL', 5, 1, 'No. 78, Tank Bund Road, Bengaluru', '+91 94444 33445', TRUE, '1976-12-10')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(4, 'RC-KA-01-987657', 'Sunita Patil', 'APL', 5, 1, 'No. 102, 5th Main, Malleshwaram, Bengaluru', '+91 94444 44556', TRUE, '1985-04-18')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(5, 'RC-KA-02-123450', 'Anand Hegde', 'BPL', 5, 2, 'No. 22, Subhash Nagar, Bengaluru', '+91 94444 55667', TRUE, '1980-07-03')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

INSERT INTO ration_cards (id, card_number, head_of_family, card_category, family_member_count, shop_id, address, phone_number, is_active, date_of_birth)
VALUES
(6, 'RC-KA-01-456123', 'Ramesh Sharma', 'BPL', 5, 1, 'No. 88, 2nd Main, Gandhi Nagar, Bengaluru', '+91 94444 66778', TRUE, '1982-05-14')
ON DUPLICATE KEY UPDATE
    head_of_family = VALUES(head_of_family),
    card_category = VALUES(card_category),
    family_member_count = 5,
    date_of_birth = VALUES(date_of_birth),
    is_active = TRUE;

-- 2. Seed exactly 30 family members (5 per card across the 6 demo cards)
-- Card 1: Suresh Kumar (ID 1)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(1, 1, 'Suresh Kumar', 'HEAD', 44, 'MALE'),
(2, 1, 'Radha Kumar', 'SPOUSE', 40, 'FEMALE'),
(3, 1, 'Kavya Kumar', 'DAUGHTER', 18, 'FEMALE'),
(4, 1, 'Aditya Kumar', 'SON', 15, 'MALE'),
(5, 1, 'Kamala Bai', 'MOTHER', 66, 'FEMALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- Card 2: Lakshmi Bai (ID 2)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(6, 2, 'Lakshmi Bai', 'HEAD', 62, 'FEMALE'),
(7, 2, 'Manjunath Bai', 'SON', 35, 'MALE'),
(8, 2, 'Sangeetha Bai', 'DAUGHTER-IN-LAW', 30, 'FEMALE'),
(9, 2, 'Chetan Kumar', 'GRANDSON', 10, 'MALE'),
(10, 2, 'Meena Kumari', 'GRANDDAUGHTER', 8, 'FEMALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- Card 3: Mohammed Rafiq (ID 3)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(11, 3, 'Mohammed Rafiq', 'HEAD', 50, 'MALE'),
(12, 3, 'Fatima Begum', 'SPOUSE', 45, 'FEMALE'),
(13, 3, 'Imran Rafiq', 'SON', 22, 'MALE'),
(14, 3, 'Zoya Rafiq', 'DAUGHTER', 19, 'FEMALE'),
(15, 3, 'Tariq Rafiq', 'SON', 14, 'MALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- Card 4: Sunita Patil (ID 4)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(16, 4, 'Sunita Patil', 'HEAD', 41, 'FEMALE'),
(17, 4, 'Vijay Patil', 'SPOUSE', 44, 'MALE'),
(18, 4, 'Aarav Patil', 'SON', 16, 'MALE'),
(19, 4, 'Divya Patil', 'DAUGHTER', 12, 'FEMALE'),
(20, 4, 'Gangadhar Patil', 'FATHER-IN-LAW', 70, 'MALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- Card 5: Anand Hegde (ID 5)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(21, 5, 'Anand Hegde', 'HEAD', 46, 'MALE'),
(22, 5, 'Geetha Hegde', 'SPOUSE', 42, 'FEMALE'),
(23, 5, 'Rahul Hegde', 'SON', 19, 'MALE'),
(24, 5, 'Sneha Hegde', 'DAUGHTER', 16, 'FEMALE'),
(25, 5, 'Parvathi Hegde', 'MOTHER', 72, 'FEMALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- Card 6: Ramesh Sharma (ID 6)
INSERT INTO family_members (id, ration_card_id, full_name, relationship, age, gender) VALUES
(26, 6, 'Ramesh Sharma', 'HEAD', 44, 'MALE'),
(27, 6, 'Priya Sharma', 'SPOUSE', 40, 'FEMALE'),
(28, 6, 'Ananya Sharma', 'DAUGHTER', 18, 'FEMALE'),
(29, 6, 'Rohit Sharma', 'SON', 14, 'MALE'),
(30, 6, 'Shanti Devi', 'MOTHER', 68, 'FEMALE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), relationship = VALUES(relationship), age = VALUES(age), gender = VALUES(gender);

-- 3. Set temporary password flag for beneficiary accounts so initial statutory password authenticates
UPDATE users SET is_temporary_password = TRUE WHERE role = 'BENEFICIARY';

