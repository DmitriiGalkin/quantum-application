import { getMetaMessages } from '../helper.js';
import type { Passport } from '../../entities/passport.js';
import type { Meet } from '../../entities/meet.js';
import { Message } from '../../entities/message.js';
import { User } from '../../entities/user.js';
import { Place } from '../../entities/place.js';

export interface Meta {
  user?: any;
  idea?: any;
  teacher: {
    description: string;
  } | null;
  project?: any;
  projects?: any[];
  passport: Passport | null;
  place: Place | null;
  meet?: Meet;
  auth?: string[];
}

export function buildMeta(
  messages: Message[],
  passport: Passport | null,
  user: User | null,
  teacher: {
    description: string;
  } | null,
): Meta {
  return {
    ...getMetaMessages(messages),
    passport,
    teacher,
    user,
  };
}
