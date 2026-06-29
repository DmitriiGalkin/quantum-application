import { User } from './user.js';
import { Passport } from './passport.js';
import { Place } from './place.js';
import { Idea } from './idea.js';
import { FeedItem, MeetExtendedDto } from '@shared/types';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  ideaId: number | null;
  placeId: number;
  passportId: number;
}

export interface FindAllProjectInput {
  userId?: string | number;
  ideaId?: number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
}

export interface ProjectFullEntity extends Project {
  users: User[];
  passport: Passport;
  place: Place;
  meets: MeetExtendedDto[];
  idea: Idea | null;
  feeds?: FeedItem[];
}