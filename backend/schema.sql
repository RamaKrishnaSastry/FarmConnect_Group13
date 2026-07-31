-- ============================================================
-- FarmConnect - Full Database Schema
-- Paste this WHOLE file into MySQL Workbench (Query tab) and run.
-- It creates the database, all 7 tables, and demo seed data.
-- ============================================================

-- 1. DATABASE
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS farmconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE farmconnect;

-- 2. USERS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS purchase_requests;
DROP TABLE IF EXISTS produce_photos;
DROP TABLE IF EXISTS produce_listings;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('FARMER', 'BUYER', 'TRANSPORTER') NOT NULL,
  phone         VARCHAR(20)  NULL,
  address       TEXT         NULL,
  city          VARCHAR(100) NULL,
  state         VARCHAR(100) NULL,
  latitude      DECIMAL(10, 8) NULL,
  longitude     DECIMAL(11, 8) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. PRODUCE LISTINGS
-- ------------------------------------------------------------
CREATE TABLE produce_listings (
  produce_id     INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id      INT NOT NULL,
  name           VARCHAR(150) NOT NULL,
  description    TEXT NULL,
  quantity       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit           VARCHAR(20) NOT NULL DEFAULT 'kg',
  price_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  location       VARCHAR(255) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produce_farmer FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_produce_farmer (farmer_id),
  INDEX idx_produce_status (status)
) ENGINE=InnoDB;

-- 4. PRODUCE PHOTOS
-- ------------------------------------------------------------
CREATE TABLE produce_photos (
  photo_id   INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT NOT NULL,
  photo_url  VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photo_produce FOREIGN KEY (produce_id) REFERENCES produce_listings(produce_id) ON DELETE CASCADE,
  INDEX idx_photo_produce (produce_id)
) ENGINE=InnoDB;

-- 5. PURCHASE REQUESTS
-- ------------------------------------------------------------
CREATE TABLE purchase_requests (
  request_id        INT AUTO_INCREMENT PRIMARY KEY,
  produce_id        INT NOT NULL,
  buyer_id          INT NOT NULL,
  requested_quantity DECIMAL(10, 2) NOT NULL,
  offered_price     DECIMAL(10, 2) NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  buyer_note        TEXT NULL,
  requested_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_produce FOREIGN KEY (produce_id) REFERENCES produce_listings(produce_id) ON DELETE CASCADE,
  CONSTRAINT fk_request_buyer   FOREIGN KEY (buyer_id)   REFERENCES users(user_id)          ON DELETE CASCADE,
  INDEX idx_request_buyer (buyer_id),
  INDEX idx_request_status (status)
) ENGINE=InnoDB;

-- 6. DELIVERIES
-- ------------------------------------------------------------
CREATE TABLE deliveries (
  delivery_id            INT AUTO_INCREMENT PRIMARY KEY,
  request_id             INT NOT NULL,
  transporter_id         INT NULL,
  status                 VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  pickup_address         VARCHAR(255) NULL,
  delivery_address       VARCHAR(255) NULL,
  pickup_latitude        DECIMAL(10, 8) NULL,
  pickup_longitude       DECIMAL(11, 8) NULL,
  delivery_latitude      DECIMAL(10, 8) NULL,
  delivery_longitude     DECIMAL(11, 8) NULL,
  distance_km            DECIMAL(10, 2) NULL,
  estimated_time_minutes INT NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at            DATETIME NULL,
  completed_at           DATETIME NULL,
  CONSTRAINT fk_delivery_request    FOREIGN KEY (request_id)     REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_delivery_transporter FOREIGN KEY (transporter_id) REFERENCES users(user_id)                ON DELETE SET NULL,
  INDEX idx_delivery_transporter (transporter_id),
  INDEX idx_delivery_status (status)
) ENGINE=InnoDB;

-- 7. RATINGS
-- ------------------------------------------------------------
CREATE TABLE ratings (
  rating_id    INT AUTO_INCREMENT PRIMARY KEY,
  request_id   INT NOT NULL,
  buyer_id     INT NOT NULL,
  rated_user_id INT NOT NULL,
  rating_type  ENUM('PRODUCT', 'DELIVERY') NOT NULL,
  rating       TINYINT NOT NULL,
  review       TEXT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rating_request   FOREIGN KEY (request_id)    REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_buyer     FOREIGN KEY (buyer_id)      REFERENCES users(user_id)               ON DELETE CASCADE,
  CONSTRAINT fk_rating_user      FOREIGN KEY (rated_user_id) REFERENCES users(user_id)               ON DELETE CASCADE,
  CONSTRAINT chk_rating_range    CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_rating_request_type (request_id, rating_type)
) ENGINE=InnoDB;

-- 8. CHAT MESSAGES
-- ------------------------------------------------------------
CREATE TABLE chat_messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  request_id  INT NOT NULL,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  sent_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_chat_request FOREIGN KEY (request_id) REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_sender   FOREIGN KEY (sender_id)   REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_chat_request (request_id)
) ENGINE=InnoDB;

-- ============================================================
-- DEMO SEED DATA
-- Password for every demo user is: password
-- (Werkzeug scrypt hashes)
-- ============================================================

-- Users (1 = Farmer, 2 = Buyer, 3 = Transporter)
INSERT INTO users (full_name, email, password_hash, role, phone, address, city, state, latitude, longitude) VALUES
('John Farmer',      'farmer@farmconnect.com',      'scrypt:32768:8:1$ghFcD1RRegsUax7X$dcfba34417c49f34b0102a3bb36b7f42fbe145ba23da55730c784979dd7e92ceeeb5d7c4625f9b499fa3ba61c44f770edebc54653cec92525d0c4027f7126b9c', 'FARMER',      '555-1234', '123 Farm Lane',       'Springfield', 'IL', 39.78170000, -89.65010000),
('Fresh Market Co.', 'buyer@farmconnect.com',       'scrypt:32768:8:1$ghFcD1RRegsUax7X$dcfba34417c49f34b0102a3bb36b7f42fbe145ba23da55730c784979dd7e92ceeeb5d7c4625f9b499fa3ba61c44f770edebc54653cec92525d0c4027f7126b9c', 'BUYER',       '555-5678', '456 Market St',       'Chicago',     'IL', 41.87810000, -87.62980000),
('Road Runner LLC',  'transporter@farmconnect.com', 'scrypt:32768:8:1$ghFcD1RRegsUax7X$dcfba34417c49f34b0102a3bb36b7f42fbe145ba23da55730c784979dd7e92ceeeb5d7c4625f9b499fa3ba61c44f770edebc54653cec92525d0c4027f7126b9c', 'TRANSPORTER', '555-9999', '78 Logistics Blvd',   'Peoria',      'IL', 40.69360000, -89.58900000);

-- Produce listings (farmer_id = 1)
INSERT INTO produce_listings (farmer_id, name, description, quantity, unit, price_per_unit, status, location) VALUES
(1, 'Organic Tomatoes', 'Fresh, ripe tomatoes from our farm',        100, 'kg',     5.50, 'AVAILABLE', '123 Farm Lane, Springfield, IL'),
(1, 'Fresh Carrots',    'Crispy, sweet carrots harvested this week', 50,  'kg',     3.20, 'AVAILABLE', '123 Farm Lane, Springfield, IL'),
(1, 'Sweet Corn',       'Golden, sweet corn ears',                   75,  'pieces', 1.80, 'AVAILABLE', '123 Farm Lane, Springfield, IL');

-- Produce photos
INSERT INTO produce_photos (produce_id, photo_url) VALUES
(1, 'https://placehold.co/400x300/2d6a4f/white?text=Tomatoes'),
(2, 'https://placehold.co/400x300/2d6a4f/white?text=Carrots'),
(3, 'https://placehold.co/400x300/2d6a4f/white?text=Corn');

-- Purchase requests (buyer_id = 2)
INSERT INTO purchase_requests (produce_id, buyer_id, requested_quantity, offered_price, status, buyer_note) VALUES
(1, 2, 50, 250.00, 'PENDING',  'Need delivery by end of week'),
(2, 2, 30,  90.00, 'APPROVED', 'Regular weekly order'),
(3, 2, 20,  30.00, 'APPROVED', 'For weekend market stall');

-- Deliveries
-- delivery 1: carrots request -> SHIPPED, unassigned (visible in transporter dashboard)
-- delivery 2: corn request    -> DELIVERED, assigned to transporter (history)
INSERT INTO deliveries (request_id, transporter_id, status, pickup_address, delivery_address,
                        pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
                        distance_km, estimated_time_minutes, accepted_at, completed_at) VALUES
(2, NULL, 'SHIPPED',   '123 Farm Lane, Springfield, IL', '456 Market St, Chicago, IL', 39.78170000, -89.65010000, 41.87810000, -87.62980000, 120.00, 180, NULL, NULL),
(3, 3,    'DELIVERED', '123 Farm Lane, Springfield, IL', '456 Market St, Chicago, IL', 39.78170000, -89.65010000, 41.87810000, -87.62980000, 120.00, 180, NOW(), NOW());

-- Ratings (buyer rates farmer's product on request 1)
INSERT INTO ratings (request_id, buyer_id, rated_user_id, rating_type, rating, review) VALUES
(1, 2, 1, 'PRODUCT', 5, 'Excellent quality tomatoes! Very fresh and perfect color.');

-- Chat (farmer -> buyer on request 1)
INSERT INTO chat_messages (request_id, sender_id, receiver_id, message) VALUES
(1, 1, 2, 'Hi! Your tomatoes are ready. Let me know if you need any details.');

-- ============================================================
-- VERIFY
-- SELECT user_id, full_name, role FROM users;
-- SELECT * FROM produce_listings;
-- SELECT * FROM purchase_requests;
-- SELECT * FROM deliveries;
-- ============================================================
