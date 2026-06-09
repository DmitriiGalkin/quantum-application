import { IdeaDto } from '@shared/types';

export const toIdeaDto = (idea: any): IdeaDto => {
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

    projects: idea.projects?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      passport: p.passport,
      place: p.place,
      users: p.users,
    })) || [],
  };
};
