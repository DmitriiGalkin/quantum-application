import { RowDataPacket } from 'mysql2/promise';
import { ChatMessageRole, ChatTarget } from '@shared/types';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string | null;
  metadata: string | null; // 👈 JSON как string
  target: ChatTarget | null;
  createdAt: Date;
}
