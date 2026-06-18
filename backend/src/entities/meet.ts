import { User } from './user.js';
import { ProjectFullEntity } from './project.js';

export interface Meet {
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  placeId: number | null;
}

export interface MeetWithProjectTitle extends Meet {
  title: string | null;
}

export interface MeetExtendedEntity extends Meet {
  users: User[];
}