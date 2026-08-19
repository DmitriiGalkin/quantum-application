import type { RowDataPacket } from 'mysql2/promise';

export interface ConversationRow extends RowDataPacket {
  id: number;
  type: 'direct';

  lastMessageId: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
