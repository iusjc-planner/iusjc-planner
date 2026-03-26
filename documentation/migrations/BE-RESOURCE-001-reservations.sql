-- BE-RESOURCE-001: Reservation d'Equipements - Migration SQL
-- Creates the resource_reservations table for equipment reservation system

CREATE TABLE IF NOT EXISTS resource_reservations (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    reserved_by BIGINT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    motif VARCHAR(500),
    expected_return_date DATETIME,
    actual_return_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resource_id FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    CONSTRAINT chk_duration CHECK (duration_minutes >= 15),
    CONSTRAINT chk_quantite CHECK (quantite >= 1),
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'RETURNED')),
    INDEX idx_resource_id (resource_id),
    INDEX idx_reserved_by (reserved_by),
    INDEX idx_status (status),
    INDEX idx_reservation_date (reservation_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments for documentation
ALTER TABLE resource_reservations MODIFY COLUMN status VARCHAR(20) COMMENT 'PENDING | CONFIRMED | CANCELLED | RETURNED';
ALTER TABLE resource_reservations MODIFY COLUMN reserved_by BIGINT COMMENT 'User ID who made the reservation';
ALTER TABLE resource_reservations MODIFY COLUMN quantite INT COMMENT 'Quantity of resources reserved';
ALTER TABLE resource_reservations MODIFY COLUMN duration_minutes INT COMMENT 'Duration of reservation in minutes';

-- Applied at: 2026-03-25
-- Status: Ready for deployment
