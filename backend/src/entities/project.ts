import { User } from './user.js';
import { Passport } from './passport.js';
import { Place } from './place.js';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  ideaId: number;
  placeId: number | null;
  passportId: number;
}

export interface FindAllProjectInput {
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
}

export interface ProjectFullEntity extends Project {
  users: User[];
  passport: Passport;
  place: Place | null;
}