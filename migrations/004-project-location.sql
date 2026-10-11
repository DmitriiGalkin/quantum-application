ALTER TABLE project
  ADD COLUMN locationId INT NULL DEFAULT NULL,
  ADD INDEX idx_project_location (locationId),
  ADD CONSTRAINT fk_project_location FOREIGN KEY (locationId) REFERENCES placeLocation (id);
