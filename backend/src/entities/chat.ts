import { ChatTarget } from '@shared/types';
import { Context } from '../services/chat/chat.meta.js';

export interface Chat {
  id: number;
  passportId: number | null;
  userId: number | null;
  title: string | null;
  target: ChatTarget;
  createdAt: Date;
  updatedAt: Date;
  metadata: Context;
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
  userId?: number | null;
}

export type UpdateChat = Partial<{
  target: ChatTarget;
  metadata: Context;
}>;