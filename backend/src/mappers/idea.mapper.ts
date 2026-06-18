import { IdeaExtendedDto, IdeaFullDto } from '@shared/types';
import { Idea, IdeaExtendedEntity, IdeaFullEntity, IdeaWithLike } from '../entities/idea.js';
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
    today: row.today,
  };
}

export function mapIdeaWithLikeRow(row: IdeaWithLikeRow): IdeaWithLike {
  return {
    ...mapIdeaRow(row),
    isLiked: Boolean(row.isLiked),
  };
}

export const toIdeaExtendedDto = (idea: IdeaExtendedEntity): IdeaExtendedDto => {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    image: idea.image,
    userCount: idea.userCount,
    isLiked: idea.isLiked,

    user: {
      id: idea.user.id,
      title: idea.user.title,
      age: idea.user.age,
      image: idea.user.image,
    },
  };
};

export const toIdeaFullDto = (idea: IdeaFullEntity): IdeaFullDto => {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    image: idea.image,
    userCount: idea.userCount,
    isLiked: idea.isLiked,

    user: {
      id: idea.user.id,
      title: idea.user.title,
      age: idea.user.age,
      image: idea.user.image,
    },

    projects:
      idea.projects?.map(project => ({
        idea: project.idea,
        meets: project.meets,
        passport: project.passport,
        place: project.place,
        users: project.users,
      })) || [],
  };
};
