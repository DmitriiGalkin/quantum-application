import type { IdeaUser, IdeaUserRow } from 'entities';

export function mapIdeaUserRow(row: IdeaUserRow): IdeaUser {
  return {
    id: row.id,
    ideaId: row.ideaId,
    userId: row.userId,
  };
}
