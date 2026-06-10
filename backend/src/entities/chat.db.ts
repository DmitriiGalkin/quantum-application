import { RowDataPacket } from 'mysql2/promise';

export interface ChatRow extends RowDataPacket {
  id: number;
  passportId: number | null;
  title: string | null;
  target: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ChatWithLastMessageRow extends ChatRow {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}