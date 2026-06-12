import { getMetaMessages } from '../helper.js';
import type { Passport } from '../../entities/passport.js';
import type { Meet } from '../../entities/meet.js';
import { Message } from '../../entities/message.js';
import { User } from '../../entities/user.js';
import { Place } from '../../entities/place.js';
import { UserDto } from '@shared/types';

export interface Teacher {
  description: string;
}

export interface Context {
  user: UserDto | null;
  passport: Passport | null;
  teacher: Teacher | null;
  idea?: any;
  project?: any;
  projects?: any[];
  place: Place | null;
  meet?: Meet;
  auth?: string[];
}
