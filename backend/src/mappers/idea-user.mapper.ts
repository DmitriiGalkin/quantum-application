import { IdeaUser } from '../entities/idea-user.js';
import { IdeaUserRow } from '../entities/idea-user.db.js';

export function mapIdeaUserRow(row: IdeaUserRow): IdeaUser {
  return {
    id: row.id,
    ideaId: row.ideaId,
    userId: row.userId,
  };
}
