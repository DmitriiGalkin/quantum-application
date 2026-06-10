import { getMetaMessages } from '../helper.js';
import type { Passport } from '../../entities/passport.js';
import type { Meet } from '../../entities/meet.js';
import { Message } from '../../entities/message.js';

export interface Meta {
  user?: any;
  idea?: any;
  teacher?: {
    description: string;
  };
  project?: any;
  projects?: any[];
  passport?: Passport;
  places?: any[];
  meet?: Meet;
  auth?: string[];
}

export function buildMeta(messages: Message[], passport: Passport): Meta {
  return {
    ...getMetaMessages(messages),
    //
    // teacher: {
    //   description: 'Профессия: учитель начальных классов...',
    // },

    passport,
  };
}
