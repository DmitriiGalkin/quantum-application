export interface Meet {
  id: number;
  projectId: number;
  price: number | null;
  duration: string | null;
  startedAt: string;
  deletedAt: string | null;
  passportId: number | null;
}

export interface User {
  id: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  age: number | null;
  image: string | null;
  createdAt: string | null;
  deletedAt: string | null;
}

export interface Passport {
  id: number;
  provider: string;
  providerId: string;
  title: string | null;
  description?: string | null;
  email: string | null;
  image: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accessToken: string | null;
}

export interface Project {
  id: number;
  passportId: number;
  placeId: number;
  ideaId: number;
  title: string | null;
  description: string | null;
  deletedAt: string | null;
}

export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  deletedAt: string | null;
}

export interface Place {
  id: number;
  title?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  image?: string;
}

export interface MeetUser {
  id: number;
  meetId: number;
  userId: number;
}

export interface IdeaUser {
  id: number;
  ideaId: number;
  userId: number;
}

export interface ProjectUser {
  id: number;
  projectId: number;
  userId: number;
}

export interface Chat {
  id: number;
  passportId: number;
  target: string;
  title: string;
  meta?: Meta;
  messages?: ChatMessage[];
}

export type ChatMetaType = 'user' | 'idea' | 'project' | 'auth';

export type ChatTarget = 'user' | 'teacher' | 'idea' | 'project' | 'meet' | 'none';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
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
  user?: User;
  idea?: Project;
  teacher?: Passport;
  project?: Project;
  projects?: Project[];
  passport?: Passport;
  places?: Place[];
  meet?: Meet;
  auth?: string[];
}