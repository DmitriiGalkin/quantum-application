import type { User } from './user.js';
import type { Passport } from './passport.js';
import type { Place } from './place.js';
import type { Idea } from './idea.js';
import type { FeedItem, MeetExtendedDto } from 'types';

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
  placeId?: number;
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