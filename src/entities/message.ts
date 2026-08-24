import type { Role } from 'entities';

export interface Message {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string | null;
}

export interface Message {
  id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: number;
}