import { User } from './user.js';
import { type ProjectFullDto, Sort } from '@shared/types';

export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  today: boolean;
  createdAt: string;
}

export interface IdeaWithLike extends Idea {
  isLiked: boolean;
}

export type CreateIdeaInput = {
  title: string | null;
  description: string | null;
  userId: number | null;
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
  when?: 'today' | 'tomorrow';
  sort?: Sort;
  latitude?: number;
  longitude?: number;
}

export interface IdeaExtendedEntity extends Idea {
  isLiked?: boolean;
  user: User;
}

export interface IdeaFullEntity extends Idea {
  isLiked?: boolean;
  user: User | null;
  projects: ProjectFullDto[];
}

