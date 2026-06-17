import { RowDataPacket } from 'mysql2/promise';
import { Role, Target } from '@shared/types';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string | null;
  target: Target | null;
  createdAt: Date;
}
