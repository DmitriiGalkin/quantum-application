import { Passport } from './passport.js';
import { User } from './user.js';
import { Project } from './project.js';
import { Place } from './place.js';
import { Meet } from './meet.js';
import { MeetFullDto } from '@shared/types';

export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string;
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

