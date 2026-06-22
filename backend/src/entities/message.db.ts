import { RowDataPacket } from 'mysql2/promise';
import { Role } from '@shared/types';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  role: Role;
  content: string;
  createdAt: string;
}
