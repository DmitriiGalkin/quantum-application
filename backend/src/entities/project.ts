import { User } from './user.js';
import { Passport } from './passport.js';
import { Place } from './place.js';
import { Meet } from './meet.js';
import { Idea } from './idea.js';

export interface Project {
  id: number;
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

interface MeetFullEntity extends Meet {
  project: Project;
  users: User[]
}

export interface ProjectFullEntity extends Project {
  users: User[];
  passport: Passport;
  place: Place | null;
  meets: MeetFullEntity[];
  idea: Idea;
}