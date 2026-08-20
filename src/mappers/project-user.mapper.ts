import type { ProjectUser } from '../entities/project-user.js';
import type { ProjectUserRow } from '../entities/project-user.db.js';

export function mapProjectUserRow(row: ProjectUserRow): ProjectUser {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    createdAt: row.createdAt,
  };
}
