import type { Idea, IdeaRow } from 'entities';

export function mapIdeaRow(row: IdeaRow): Idea {
  return {
    id: row.id,
    userId: row.userId,
    passportId: row.passportId,
    title: row.title,
    description: row.description,
    image: row.image,
    userCount: row.userCount,
    today: row.today,
    createdAt: row.createdAt,
  };
}
