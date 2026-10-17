ALTER TABLE conversationPassport ADD COLUMN lastDeliveredMessageId INT UNSIGNED NULL, ADD COLUMN lastReadMessageId INT UNSIGNED NULL;
ALTER TABLE meet ADD COLUMN bookingState VARCHAR(24) NOT NULL DEFAULT 'requested', ADD COLUMN bookingRevision INT UNSIGNED NOT NULL DEFAULT 0;
UPDATE meet SET bookingState = 'confirmed' WHERE status = 'published';
UPDATE meet SET bookingState = 'needs_location' WHERE status = 'cancelled';
CREATE TABLE meetBookingChange (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  meetId INT UNSIGNED NOT NULL,
  revision INT UNSIGNED NOT NULL,
  oldPlaceId INT UNSIGNED NOT NULL,
  oldLocationId INT UNSIGNED NULL,
  newPlaceId INT UNSIGNED NOT NULL,
  newLocationId INT UNSIGNED NULL,
  reason VARCHAR(2000) NOT NULL,
  actorPassportId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ix_meet_change (meetId, revision)
) ENGINE=InnoDB;
CREATE TABLE meetChangeParticipant (
  meetId INT UNSIGNED NOT NULL,
  revision INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  response VARCHAR(16) NOT NULL DEFAULT 'pending',
  respondedAt DATETIME NULL,
  PRIMARY KEY (meetId, revision, userId)
) ENGINE=InnoDB;
CREATE TABLE appNotification (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  passportId INT UNSIGNED NOT NULL,
  eventKey VARCHAR(190) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  url VARCHAR(500) NOT NULL,
  readAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pushedAt DATETIME NULL,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY ix_notification_event (passportId, eventKey),
  KEY ix_notification_unread (passportId, readAt)
) ENGINE=InnoDB;
CREATE TABLE pushSubscription (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  passportId INT UNSIGNED NOT NULL,
  endpoint TEXT NOT NULL,
  endpointHash CHAR(64) NOT NULL,
  subscription JSON NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ix_push_endpoint (endpointHash),
  KEY ix_push_passport (passportId)
) ENGINE=InnoDB;
CREATE TABLE paymentRefund (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  paymentId INT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  requestId VARCHAR(100) NULL,
  error VARCHAR(2000) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ix_refund_payment (paymentId)
) ENGINE=InnoDB;
