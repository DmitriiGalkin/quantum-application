import { User } from './user.js';
import { Place } from './place.js';
import { Passport } from './passport.js';

export interface Meet {
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId: number;
}

export interface MeetWithProjectTitle extends Meet {
  title: string | null;
}
