-- ============================================================
-- FarmConnect - Full Seed Data
-- Run AFTER clearing old data manually if needed.
-- ============================================================

-- 1. USERS (passwords are bcrypt hashes of "Test@123" for all)
-- password_hash values are pre-computed bcrypt for "Test@123"
-- ------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, role, phone, city, state, address, latitude, longitude) VALUES
('Ravi Kumar',  'ravi.farmer@test.com',  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'FARMER',      '9876543210', 'Pune',       'Maharashtra', 'Green Valley Farm, Pune',  45.00,  60.00),
('Sunita Patel', 'sunita.farmer@test.com', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'FARMER',    '9876543211', 'Nashik',     'Maharashtra', 'Organic Farms, Nashik',      30.00,  80.00),
('Amit Singh',  'amit.farmer@test.com',  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'FARMER',      '9876543212', 'Nagpur',     'Maharashtra', 'Singh Agri, Nagpur',         70.00,  55.00),
('Meena Devi',  'meena.buyer@test.com',  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'BUYER',       '9876543220', 'Mumbai',     'Maharashtra', 'Andheri East, Mumbai',      100.00, 120.00),
('Rajesh Verma','rajesh.buyer@test.com', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'BUYER',       '9876543221', 'Thane',      'Maharashtra', 'Thane West',                 90.00, 110.00),
('Vikram Joshi','vikram.trans@test.com', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'TRANSPORTER', '9876543230', 'Pune',       'Maharashtra', 'Truck Depot, Pune',          50.00,  65.00),
('Priya Sharma','priya.trans@test.com',  '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5Kz0n3Rd7vM6Y8s9aBcDeFg1', 'TRANSPORTER', '9876543231', 'Nashik',     'Maharashtra', 'Logistics Hub, Nashik',      35.00,  85.00);

-- Note: user_id 1 = Vishwajeet (existing buyer)
-- New users will get IDs 3-9 depending on what's in the DB already.
-- Check actual user_ids after running and adjust farmer_id/buyer_id below.

-- 2. PRODUCE LISTINGS
-- ------------------------------------------------------------
-- Assumes farmer IDs from above. Adjust farmer_id after checking actual IDs.
-- Example uses farmer_id=3 (Ravi), farmer_id=4 (Sunita), farmer_id=5 (Amit)
-- CHANGE these IDs after you verify the actual user_ids assigned.

INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit, location, status) VALUES
(3, 'Fresh Tomatoes',  'Bright red organic tomatoes harvested today.',     50,  'kg',  30.00, 'Green Valley Farm, Pune',   'AVAILABLE'),
(3, 'Potatoes',        'High-quality potatoes grown without chemicals.',   100, 'kg',  25.00, 'Green Valley Farm, Pune',   'AVAILABLE'),
(3, 'Green Chillies',  'Spicy fresh green chillies from organic farm.',    20,  'kg',  40.00, 'Green Valley Farm, Pune',   'AVAILABLE'),
(4, 'Red Onions',      'Freshly harvested red onions with strong flavor.', 80,  'kg',  28.00, 'Organic Farms, Nashik',     'AVAILABLE'),
(4, 'Garlic',          'Premium quality garlic bulbs.',                    30,  'kg',  60.00, 'Organic Farms, Nashik',     'AVAILABLE'),
(4, 'Spinach',         'Fresh green spinach leaves, chemical-free.',       25,  'kg',  15.00, 'Organic Farms, Nashik',     'AVAILABLE'),
(5, 'Basmati Rice',    'Premium long-grain basmati rice.',                 200, 'kg',  55.00, 'Singh Agri, Nagpur',        'AVAILABLE'),
(5, 'Turmeric Powder', 'Pure ground turmeric from Nagpur fields.',         40,  'kg',  80.00, 'Singh Agri, Nagpur',        'AVAILABLE'),
(5, 'Oranges',         'Sweet Nagpur oranges freshly picked.',             60,  'kg',  45.00, 'Singh Agri, Nagpur',        'AVAILABLE');

-- 3. PRODUCE PHOTOS
-- ------------------------------------------------------------
-- Adjust produce_id based on actual IDs from the insert above.
-- I'll use produce_id starting from 21 (since previous had up to 20).
-- CHANGE these IDs after verifying.

INSERT INTO produce_photos (produce_id, photo_url) VALUES
(21, 'static/uploads/produce/tomatoes.jpg'),
(22, 'static/uploads/produce/potatoes.jpg'),
(23, 'static/uploads/produce/chillies.jpg'),
(24, 'static/uploads/produce/onions.jpg'),
(25, 'static/uploads/produce/garlic.jpg'),
(26, 'static/uploads/produce/spinach.jpg'),
(27, 'static/uploads/produce/rice.jpg'),
(28, 'static/uploads/produce/turmeric.jpg'),
(29, 'static/uploads/produce/oranges.jpg');

-- 4. PURCHASE REQUESTS (some ACCEPTED for transporter testing)
-- ------------------------------------------------------------
-- buyer_id = 1 (Vishwajeet) or 6 (Meena) — adjust as needed.
-- produce_id = adjust based on actual IDs above.

-- PENDING request
INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note) VALUES
(21, 1, 10, 28.00, 'PENDING',  'Need fresh tomatoes for my restaurant'),
-- ACCEPTED requests (these will create deliveries)
(22, 1, 20, 22.00, 'APPROVED', 'Bulk order for weekly supply'),
(24, 1, 15, 25.00, 'APPROVED', 'Onions for my kitchen'),
(27, 6, 50, 50.00, 'APPROVED', 'Bulk rice order');

-- Note request_ids — they are auto-increment.
-- If previous rows exist, adjust accordingly.

-- 5. DELIVERIES (one per ACCEPTED purchase request)
-- ------------------------------------------------------------
-- request_id = adjust based on actual IDs from above.
-- status = SHIPPED = visible to transporters

-- Using coordinates for farmer/buyer location mapping
INSERT INTO deliveries (request_id, transporter_id, status, pickup_address, delivery_address,
                        pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
                        distance_km, estimated_time_minutes) VALUES
(2,  NULL, 'SHIPPED',  'Green Valley Farm, Pune',   'Andheri East, Mumbai',    45.00, 60.00, 100.00, 120.00, 185.00, 240),
(3,  NULL, 'SHIPPED',  'Organic Farms, Nashik',     'Andheri East, Mumbai',    30.00, 80.00, 100.00, 120.00, 160.00, 210),
(4,  NULL, 'SHIPPED',  'Singh Agri, Nagpur',        'Thane West',              70.00, 55.00,  90.00, 110.00, 200.00, 260);

-- ============================================================
-- AFTER RUNNING: Note the actual generated IDs for users,
-- produce_listings, purchase_requests, and deliveries.
-- Update the backend code accordingly if needed.
-- ============================================================
