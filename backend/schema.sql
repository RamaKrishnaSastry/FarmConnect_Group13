-- ============================================================
-- FarmConnect - Database Schema
-- MySQL 8.0+
-- Usage: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS farmconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmconnect;

-- ------------------------------------------------------------
-- USERS (farmers, buyers, transporters)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('FARMER', 'BUYER', 'TRANSPORTER') NOT NULL,
    phone         VARCHAR(20),
    address       TEXT,
    city          VARCHAR(100),
    state         VARCHAR(100),
    latitude      DECIMAL(10, 8),
    longitude     DECIMAL(11, 8),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- PRODUCE LISTINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produce_listings (
    produce_id     INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id      INT NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    quantity       DECIMAL(10, 2) NOT NULL,
    unit           VARCHAR(20) NOT NULL DEFAULT 'kg',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    status         ENUM('AVAILABLE', 'SOLD') NOT NULL DEFAULT 'AVAILABLE',
    location       VARCHAR(255),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_produce_farmer FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PRODUCE PHOTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produce_photos (
    photo_id   INT AUTO_INCREMENT PRIMARY KEY,
    produce_id INT NOT NULL,
    photo_url  VARCHAR(255) NOT NULL,
    CONSTRAINT fk_photo_produce FOREIGN KEY (produce_id) REFERENCES produce_listings(produce_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PURCHASE REQUESTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_requests (
    request_id         INT AUTO_INCREMENT PRIMARY KEY,
    produce_id         INT NOT NULL,
    buyer_id           INT NOT NULL,
    requested_quantity DECIMAL(10, 2) NOT NULL,
    offered_price      DECIMAL(10, 2),
    status             ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'DELIVERING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    buyer_note         TEXT,
    requested_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_produce FOREIGN KEY (produce_id) REFERENCES produce_listings(produce_id) ON DELETE CASCADE,
    CONSTRAINT fk_request_buyer   FOREIGN KEY (buyer_id)   REFERENCES users(user_id)          ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- DELIVERIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id              INT AUTO_INCREMENT PRIMARY KEY,
    request_id               INT NOT NULL,
    transporter_id           INT NULL,
    status                   ENUM('PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    pickup_address           VARCHAR(255),
    delivery_address         VARCHAR(255),
    pickup_latitude          DECIMAL(10, 8),
    pickup_longitude         DECIMAL(11, 8),
    delivery_latitude        DECIMAL(10, 8),
    delivery_longitude       DECIMAL(11, 8),
    distance_km              DECIMAL(10, 2),
    estimated_time_minutes   INT,
    accepted_at              DATETIME,
    completed_at             DATETIME,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_request     FOREIGN KEY (request_id)     REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_delivery_transporter FOREIGN KEY (transporter_id) REFERENCES users(user_id)               ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- RATINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    rating_id     INT AUTO_INCREMENT PRIMARY KEY,
    request_id    INT NOT NULL,
    buyer_id      INT NOT NULL,
    rated_user_id INT NOT NULL,
    rating_type   ENUM('PRODUCT', 'DELIVERY') NOT NULL,
    rating        INT NOT NULL,
    review        TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_rating (request_id, rating_type),
    CONSTRAINT fk_rating_request FOREIGN KEY (request_id)    REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_buyer   FOREIGN KEY (buyer_id)      REFERENCES users(user_id)               ON DELETE CASCADE,
    CONSTRAINT fk_rating_rated   FOREIGN KEY (rated_user_id) REFERENCES users(user_id)               ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- CHAT MESSAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id  INT AUTO_INCREMENT PRIMARY KEY,
    request_id  INT NOT NULL,
    sender_id   INT NOT NULL,
    receiver_id INT NOT NULL,
    message     TEXT NOT NULL,
    sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_chat_request  FOREIGN KEY (request_id)  REFERENCES purchase_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_sender   FOREIGN KEY (sender_id)   REFERENCES users(user_id)               ON DELETE CASCADE,
    CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id)               ON DELETE CASCADE
);
