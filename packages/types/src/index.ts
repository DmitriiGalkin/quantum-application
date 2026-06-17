
export type Target = 'idea' | 'project' | 'meet';

export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetDto;
  ideas?: IdeaDto[];
  project?: ProjectDto;
  idea?: IdeaDto;
}

export type Role = 'user' | 'assistant' | 'system';

export type MessageDto = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string;
};

export interface ChatDto {
  id: number;
  passportId: number;
  target: Target;
  context?: ContextDto;
  messages?: MessageDto[];
}

export interface ChatMessagesResult {
  message: MessageDto;
  context?: ContextDto;
}

export type Ui = 'auth' | 'map' | 'idea' | 'project' | 'meet' | 'ideas';

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;

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
  priceFrom: number | null;

  meets: MeetDto[];
}

export interface ProjectDto {
  id: number;

  idea: {
    id: number;
    title: string;
    description: string | null;
    image: string | null;
  };
  passport: {
    title: string;
    image: string | null;
  } | null;
  place: {
    title: string;
    address: string | null;
    description: string | null;
  } | null;
  meets?: {
    id: number;
    startedAt: string;
    duration: number | null;
    price: number | null;
  }[];
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
export interface CreateChat {
  chatId: number;
  target: Target;
}
export interface CreateChatBody {
  target: Target;
  userId?: number;
  projectId?: number;
  ideaId?: number;
}
export interface CreateIdeaUser {
  ideaId: number;
  userId: number;
}
export interface DeleteIdeaUser {
  ideaId: number;
  userId: number;
}
export interface CreateMeetUser {
  meetId: number;
  userId: number;
}
export interface CreateMessage {
  chatId: number;
  message: string;
  target?: Target;
}


export type CreateMessageDto = {
  role: Role;
  content: string;
  context?: ContextDto;
};
export interface CreateChatMessages {
  chatId: number;
  messages: CreateMessageDto[];
  ui?: string;
}

export type DraftProject = {
  id: number;
  title: string;
};
