import { IdeaUser } from '../entities/ideaUser.js';

export const toIdeaUser = (row: any): IdeaUser => ({
  id: row.id,
  ideaId: row.ideaId,
  userId: row.userId,
});
