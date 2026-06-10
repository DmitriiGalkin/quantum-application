import { ChatTarget } from '@shared/types';

export interface Chat {
  id: number;
  passportId: number | null;
  title: string | null;
  target: ChatTarget;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatWithLastMessage extends Chat {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}

export interface CreateChatInput {
  passportId: number | null;
  title?: string | null;
  target?: string | null;
}