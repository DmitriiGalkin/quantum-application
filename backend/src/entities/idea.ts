export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  userCount: number;
}

export interface IdeaWithLike extends Idea {
  isLiked: boolean;
}

export type CreateIdeaInput = {
  title: string | null;
  description: string | null;
  userId: number;
  passportId: number | null;
};

export type UpdateIdeaInput = Partial<{
  title: string | null;
  description: string | null;
  image: string | null;
}>;

export interface FindAllIdeaInput {
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
}