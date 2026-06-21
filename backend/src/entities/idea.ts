import { Passport } from './passport.js';
import { User } from './user.js';
import { Place } from './place.js';
import { Meet } from './meet.js';
import { Sort } from '@shared/types';

export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  today: boolean;
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
  user: User;
  projects: {
    passport: Passport | null;
    place: Place | null;
    users: User[];
    idea: Idea;
    meets: Meet[];
  }[];
}

