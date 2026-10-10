ALTER TABLE idea
  MODIFY passportId INT NULL,
  ADD COLUMN catalogId VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  ADD COLUMN cardData JSON NULL,
  ADD COLUMN catalogMetadata JSON NULL,
  ADD UNIQUE KEY uq_idea_catalogId (catalogId);

CREATE TABLE ideaPhoto (
  id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  ideaId INT NOT NULL,
  position INT UNSIGNED NOT NULL,
  photoData JSON NOT NULL,
  PRIMARY KEY (id),
  KEY ix_ideaPhoto_ideaId (ideaId),
  CONSTRAINT fk_ideaPhoto_idea FOREIGN KEY (ideaId) REFERENCES idea(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
