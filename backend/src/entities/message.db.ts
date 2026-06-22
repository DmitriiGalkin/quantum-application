import { RowDataPacket } from 'mysql2/promise';
import { Role, Target } from '@shared/types';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  role: Role;
  content: string;
  target: Target | null;
  createdAt: string;
}
