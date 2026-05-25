import type { ChatTarget } from './requests.ts';

export const getCaption = (target: ChatTarget): string => {
  switch (target) {
    case 'user':
      return 'узнаю об участнике проекта';
    case 'idea':
      return 'помогаю придумать идею проекта';
    default:
      return 'отдыхаю';
  }
};