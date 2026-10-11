ALTER TABLE meet
  ADD COLUMN locationId INT NULL,
  ADD COLUMN maxParticipants INT NULL,
  ADD INDEX idx_meet_teacher_time (passportId, startedAt),
  ADD INDEX idx_meet_location_time (locationId, startedAt),
  ADD CONSTRAINT fk_meet_location FOREIGN KEY (locationId) REFERENCES placeLocation(id) ON DELETE SET NULL,
  ADD CONSTRAINT chk_meet_max_participants CHECK (maxParticipants IS NULL OR maxParticipants > 0);
