import type { IdeaDto, IdeaDashboard, Idea, IdeaWithLike, IdeaRow, IdeaWithLikeRow } from 'entities';

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

export function mapIdeaWithLikeRow(row: IdeaWithLikeRow): IdeaWithLike {
  return {
    ...mapIdeaRow(row),
    isLiked: Boolean(row.isLiked),
  };
}

export const toIdeaExtendedDto = (idea: IdeaDto): IdeaDto => {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    image: idea.image,
    userCount: idea.userCount,
    isLiked: idea.isLiked,
    createdAt: idea.createdAt,

    user: idea.user ? {
      id: idea.user.id,
      title: idea.user.title,
      age: idea.user.age,
      image: idea.user.image,
    } : null,
  };
};

export const toIdeaFullDto = (idea: IdeaDashboard): IdeaDashboard => {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    image: idea.image,
    userCount: idea.userCount,
    isLiked: idea.isLiked,
    createdAt: idea.createdAt,

    user: idea.user ? {
      id: idea.user.id,
      title: idea.user.title,
      age: idea.user.age,
      image: idea.user.image,
    } : null,

    projects:
      idea.projects?.map(project => ({
        ...project,
        idea: project.idea,
        meets: project.meets,
        passport: project.passport,
        place: project.place,
        users: project.users,
      })) || [],
  };
};
