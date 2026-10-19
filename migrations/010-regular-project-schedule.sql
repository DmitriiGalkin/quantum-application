ALTER TABLE project
  ADD COLUMN kind ENUM('project', 'regular') NOT NULL DEFAULT 'project' AFTER locationId,
  ADD COLUMN weeklySchedule JSON NULL AFTER kind;
