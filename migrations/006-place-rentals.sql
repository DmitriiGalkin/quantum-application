ALTER TABLE placeLocation
  ADD COLUMN description TEXT NULL,
  ADD COLUMN capacity INT NULL,
  ADD COLUMN hourlyRate DECIMAL(10,2) NULL,
  ADD COLUMN rentalEnabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD CONSTRAINT chk_room_capacity CHECK (capacity IS NULL OR capacity > 0),
  ADD CONSTRAINT chk_room_rate CHECK (hourlyRate IS NULL OR hourlyRate >= 0);

CREATE TABLE placeLocationPhoto (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  locationId INT NOT NULL,
  url VARCHAR(2048) NOT NULL,
  position INT NOT NULL,
  INDEX ix_room_photo (locationId, position),
  CONSTRAINT fk_room_photo FOREIGN KEY (locationId) REFERENCES placeLocation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE placeRental (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  placeId INT NOT NULL,
  locationId INT NOT NULL,
  passportId INT NOT NULL,
  startedAt DATETIME NOT NULL,
  endedAt DATETIME NOT NULL,
  participants INT NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending','confirmed','rejected','cancelled') NOT NULL DEFAULT 'pending',
  rejectionReason TEXT NULL,
  hourlyRate DECIMAL(10,2) NULL,
  estimatedTotal DECIMAL(12,2) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_rental_room_slot (locationId, status, startedAt, endedAt),
  INDEX ix_rental_applicant (passportId, startedAt),
  INDEX ix_rental_place (placeId, startedAt),
  CONSTRAINT fk_rental_place FOREIGN KEY (placeId) REFERENCES place(id),
  CONSTRAINT fk_rental_room FOREIGN KEY (locationId) REFERENCES placeLocation(id),
  CONSTRAINT fk_rental_applicant FOREIGN KEY (passportId) REFERENCES passport(id),
  CONSTRAINT chk_rental_interval CHECK (endedAt > startedAt AND endedAt <= DATE_ADD(startedAt, INTERVAL 24 HOUR)),
  CONSTRAINT chk_rental_participants CHECK (participants > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
