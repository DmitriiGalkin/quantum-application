import type { RowDataPacket } from 'mysql2/promise';
import type { Role } from 'dto';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  role: Role;
  content: string;
  createdAt: string;
}
