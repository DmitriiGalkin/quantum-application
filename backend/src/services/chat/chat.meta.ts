import { getMetaMessages } from '../helper.js';
import type { Meta } from '@shared/types';
import type { Passport } from '../../entities/passport.js';

export function buildMeta(messages: any[], passport: Passport): Meta {
  return {
    ...getMetaMessages(messages),

    teacher: {
      description: 'Профессия: учитель начальных классов...',
    },

    passport,
  };
}
