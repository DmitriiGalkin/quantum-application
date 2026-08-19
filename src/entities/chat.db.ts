import type { RowDataPacket } from 'mysql2/promise';
import type{ Target } from 'dto';
import type { Context } from '../services/chat/chat.meta.js';

export interface ChatRow extends RowDataPacket {
  id: number;
  passportId: number | null;
  target: Target;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  context: Context;
}

export interface ChatWithLastMessageRow extends ChatRow {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}