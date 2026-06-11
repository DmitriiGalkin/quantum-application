export interface Chat {
  id: number;
  passportId: number;
  target: ChatTarget;
  title: string;
  meta?: Meta;
  messages?: MessageDto[];
}

export type ChatMetaType = 'user' | 'idea' | 'project' | 'auth';

export type ChatTarget = 'user' | 'teacher' | 'idea' | 'project' | 'meet' | 'none' | 'auth' | 'place';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type MessageDto = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string;
  metadata: unknown;
  createdAt?: string;
  meta?: {
    target: ChatMetaType;
    data: unknown;
  };
  target: ChatTarget;
};

export interface Meta {
  user?: any;
  idea?: any;
  teacher?: {
    description: string;
  };
  project?: any;
  projects?: any[];
  passport?: PassportDto;
  places?: any[];
  meet?: MeetDto;
  auth?: string[];
}

/* Типы для методов */
export interface IParams {
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
  ideaId?: string | number;
}

export interface IdeaDto {
  id: number;
  title: string;
  description: string;
  image: string | null;
  userCount: number;
  isLiked: boolean;

  user: {
    id: number;
    title: string;
    age: number;
  } | null;

  projects: ProjectDto[];
}

export interface MeetDto {
  id: number;
  projectId: number;
  startedAt: string;
  duration?: number;
  price?: number;

  project: {
    id: number;
    title: string;
    place: {
      id: number;
      title: string;
    } | null;
  } | null;

  users: {
    id: number;
    meetUserId?: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}

export interface UserDto {
  id: number;
  title: string | null;
  description?: string | null;
  age: number | null;
  image: string | null;
}

export interface PlaceDto {
  id: number;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  image: string | null;

  meets: MeetDto[];
}

export interface ProjectDto {
  id: number;
  passportId: number;
  placeId: number;
  ideaId: number;
  title: string;
  description: string;

  passport?: {
    title: string;
    image: string;
  } | null;
  place?: {
    address: string;
    title: string;
    description: string;
  };
  meets?: MeetDto[];
  users?: {
    id: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}

export interface PassportDto {
  id: number;
  title: string;
  description: string | null;
  users: {
    id: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}

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

// КОНТРАКТЫ
export interface CreateChatBody {
  target: ChatTarget;
  userId?: number;
}
export interface CreateIdeaUser {
  ideaId: number;
  userId: number;
}
export interface DeleteIdeaUser {
  ideaId: number;
  userId: number;
}
export interface CreateMessage {
  chatId: number;
  message: string;
  target?: ChatTarget;
}