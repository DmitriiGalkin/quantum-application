ALTER TABLE meet
  ADD COLUMN venuePrice DECIMAL(12,2) NULL DEFAULT NULL,
  ADD COLUMN venueQuoteVersion INT UNSIGNED NOT NULL DEFAULT 0;

CREATE TABLE meetVenueQuote (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  meetId INT NOT NULL,
  version INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  actorPassportId INT NOT NULL,
  status ENUM('offered','accepted','declined','superseded','cancelled') NOT NULL DEFAULT 'offered',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_meet_venue_quote_version (meetId, version),
  KEY ix_meet_venue_quote_status (meetId, status),
  CONSTRAINT fk_meet_venue_quote_meet FOREIGN KEY (meetId) REFERENCES meet(id),
  CONSTRAINT chk_meet_venue_quote_amount CHECK (amount >= 0)
);

DROP TABLE placeRental;
ALTER TABLE placeLocation DROP COLUMN rentalEnabled;
