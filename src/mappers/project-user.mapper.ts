import type { ProjectUser, ProjectUserRow } from 'entities';

export function mapProjectUserRow(row: ProjectUserRow): ProjectUser {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    createdAt: row.createdAt,
  };
}
