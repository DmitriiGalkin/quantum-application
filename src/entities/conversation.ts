import type { RowDataPacket } from 'mysql2/promise';
import type { Message } from './message.js';

export interface ConversationRow extends RowDataPacket {
  id: number;
  type: 'direct';

  lastMessageId: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Conversation {
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
