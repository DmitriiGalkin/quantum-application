import { Target } from 'types';
import { Context } from '../services/chat/chat.meta.js';

export interface Chat {
  id: number;
  passportId: number | null;
  userId: number | null;
  target: Target;
  context: Context;
}

export interface ChatWithLastMessage extends Chat {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}

export interface CreateChatInput {
  passportId: number | null;
  title?: string | null;
  target?: Target;
  userId?: number | null;
  context?: Context;
}

export type UpdateChat = Partial<{
  target: Target;
  context: Context;
}>;