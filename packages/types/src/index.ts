export interface Chat {
  id: number;
  passportId: number;
  target: string;
  title: string;
  meta?: Meta;
  messages?: MessageDto[];
}

export type ChatMetaType = 'user' | 'idea' | 'project' | 'auth';

export type ChatTarget = 'user' | 'teacher' | 'idea' | 'project' | 'meet' | 'none';

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
  teacher?: PassportDto;
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
}

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;

  user: {
    id: number;
    title: string;
  } | null;

  participants: {
    userId: number;
  }[];
}

export interface MeetDto {
  id: number;
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
    meetUserId: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}

export interface UserDto {
  id: number;
  title: string | null;
  age: number | null;
  image: string | null;
}

export interface PlaceDto {
  id: number;
  title?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  image?: string;

  meets: {
    id: number;
    startedAt: string;
    duration?: number;
    price?: number;
    project: {
      title: string;
    };
  }[];
}

export interface ProjectDto {
  id: number;
  passportId: number;
  placeId: number;
  ideaId: number;
  title: string | null;
  description: string | null;

  passport?: {
    title: string;
  } | null;
  place?: {
    address: string;
    title: string;
    description: string;
  };
  meets?: {
    id: number;
    startedAt: string;
    duration?: number;
    price?: number;
  }[];
  users?: {
    title: string;
    age: number | null;
    image: string | null;
  }[];
}

export interface PassportDto {
  id: number;
  title: string;
  users?: {
    id: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}