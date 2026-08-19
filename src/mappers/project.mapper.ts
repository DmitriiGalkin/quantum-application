import type { Project } from '../entities/project.js';
import type { ProjectRow } from '../entities/project.db.js';

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    ideaId: row.ideaId,
    placeId: row.placeId,
    passportId: row.passportId,
  };
}
