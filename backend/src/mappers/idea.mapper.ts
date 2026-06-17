import { IdeaDto } from '@shared/types';
import { Idea, IdeaFullEntity, IdeaWithLike } from '../entities/idea.js';
import { IdeaRow, IdeaWithLikeRow } from '../entities/idea.db.js';

export function mapIdeaRow(row: IdeaRow): Idea {
  return {
    id: row.id,
    userId: row.userId,
    passportId: row.passportId,
    title: row.title,
    description: row.description,
    image: row.image,
    userCount: row.userCount,
  };
}

export function mapIdeaWithLikeRow(row: IdeaWithLikeRow): IdeaWithLike {
  return {
    ...mapIdeaRow(row),
    isLiked: Boolean(row.isLiked),
  };
}

export const toIdeaDto = (idea: IdeaFullEntity): IdeaDto => {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    image: idea.image,
    userCount: idea.userCount,
    isLiked: idea.isLiked,

    user: idea.user
      ? {
          id: idea.user.id,
          title: idea.user.title,
          age: idea.user.age,
        }
      : null,

    projects:
      idea.projects?.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        passport: project.passport,
        place: project.place,
        users: project.users,
      })) || [],
  };
};
