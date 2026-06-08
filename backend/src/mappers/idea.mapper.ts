import { IdeaDto } from '@shared/types';

export const toIdeaDto = (idea: any): IdeaDto => ({
  id: idea.id,
  title: idea.title,
  description: idea.description,
  image: idea.image,
  user: idea.user
    ? {
        id: idea.user.id,
        title: idea.user.title,
      }
    : null,
  participants: idea.ideaUsers.map((u: any) => ({
    userId: u.userId,
  })),
});
