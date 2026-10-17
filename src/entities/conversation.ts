import type { RowDataPacket } from 'mysql2/promise';
import type { Message } from './message.js';
import type { PassportDto } from './passport.js';

export interface ConversationRow extends RowDataPacket {
  id: number;
  type: 'direct';

  lastMessageId: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Conversation {
  unreadCount?: number;
  counterpart?: PassportDto | null;
  lastMessage?: Message | null;
  id: number;
  passportId: number;
  createdAt: string;
  participants?: {
    passportId: number;
    userId: number;
  }[];
  messages?: Message[];
}

export interface StartConversationRequest {
  passportId: number;
  targetPassportId?: number;
}

export interface StartConversationResponse {
  exists: boolean;
  conversation: Conversation;
}

export interface ConversationHistory {
  receipts?: import('./operations.js').MessageReceipt[];
  conversation: Conversation;
  messages: Message[];
}
