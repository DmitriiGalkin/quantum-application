import type { RowDataPacket } from 'mysql2/promise';

export interface Message2Row extends RowDataPacket {
  id: number;

  conversationId: number;
  senderPassportId: number;

  text: string;

  createdAt: string;
  updatedAt: string;

  editedAt: string | null;
  deletedAt: string | null;
}

export interface Message {
  id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: number;
}

export interface CreateMessageRequest {
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}