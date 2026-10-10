import type { Idea, IdeaRow } from 'entities';

export function mapIdeaRow(row: IdeaRow): Idea {
  return {
    id: row.id,
    userId: row.userId,
    passportId: row.passportId,
    title: row.title,
    description: row.description,
    image: row.image,
    catalogId: row.catalogId ?? null,
    cardData: row.cardData ?? null,
    catalogMetadata: row.catalogMetadata ?? null,
    photos: [],
    userCount: row.userCount,
    today: row.today,
    createdAt: row.createdAt,
  };
}
