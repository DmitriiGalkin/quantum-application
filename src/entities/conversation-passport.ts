import type { RowDataPacket } from 'mysql2/promise';

export interface ConversationPassportRow extends RowDataPacket {
  lastDeliveredMessageId?: number | null;
  lastReadMessageId?: number | null;
  conversationId: number;
  passportId: number;

  lastReadAt: string | null;

  isArchived: boolean;
  isMuted: boolean;

  createdAt: string;
}
