export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';

export type ActiveRole = 'user' | 'teacher' | 'place' | 'guest';

export type Sort = 'nearby' | 'popular' | 'new';

export type When = 'today' | 'tomorrow' | undefined;

export type View = 'module' | 'map' | 'group';

export type MeetStatus = 'pending' | 'published' | 'cancelled';

export type * from './conversation.js';
export type * from './conversation-passport.js';
export type * from './idea.js';
export type * from './idea-user.js';
export type * from './location.js';
export type * from './meet.js';
export type * from './meet-user.js';
export type * from './message.js';
export type * from './passport.js';
export type * from './payment.ts';
export type * from './place.js';
export type * from './place-passport.js';
export type * from './place-schedule.js';
export type * from './project.js';
export type * from './project-user.js';
export type * from './teacher.js';
export type * from './teacher-user.js';
export type * from './user.js';


export interface PageMeta {
  title: string;
  description: string;
  // Заголовок страницы при шаринге (до 60 символов)
  ogTitle: string;
  // Краткое описание под заголовком (1–2 строки текста)
  ogDescription: string;
  // Картинка превью (рекомендации: JPG / PNG, 1200×630 px, абсолютный URL)
  ogImage: string;
  // Тип контента
  ogType: string;
  // Название сайта/бренда (Показывается мелким текстом. Не всегда отображается во всех платформах)
  ogSiteName?: string;
}

export type * from './conversation.js';
export type * from './conversation-passport.js';
export type * from './idea.js';
export type * from './feed.js';
export type * from './idea-user.js';
export type * from './location.js';
export type * from './meet.js';
export type * from './meet-user.js';
export type * from './message.js';
export type * from './passport.js';
export type * from './payment.ts';
export type * from './place.js';
export type * from './place-passport.js';
export type * from './place-schedule.js';
export type * from './project.js';
export type * from './project-user.js';
export type * from './teacher.js';
export type * from './teacher-user.js';
export type * from './user.js';
