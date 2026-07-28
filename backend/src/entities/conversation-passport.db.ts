import { RowDataPacket } from 'mysql2/promise';

export interface ConversationPassportRow extends RowDataPacket {
  conversationId: number;
  passportId: number;

  lastReadAt: string | null;

  isArchived: boolean;
  isMuted: boolean;

  createdAt: string;
}
