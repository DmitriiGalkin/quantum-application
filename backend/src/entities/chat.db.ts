import { RowDataPacket } from 'mysql2/promise';
import { ChatTarget } from '@shared/types';
import { Context } from '../services/chat/chat.meta.js';

export interface ChatRow extends RowDataPacket {
  id: number;
  passportId: number | null;
  title: string | null;
  target: ChatTarget;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  metadata: Context;
}

export interface ChatWithLastMessageRow extends ChatRow {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}