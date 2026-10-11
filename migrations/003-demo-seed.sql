CREATE TABLE IF NOT EXISTS demoSeedRecord (
  seedKey varchar(64) NOT NULL,
  entityType varchar(32) NOT NULL,
  entityKey varchar(128) NOT NULL,
  recordId int NOT NULL,
  PRIMARY KEY (seedKey, entityType, entityKey),
  UNIQUE KEY demo_record_unique (entityType, recordId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
