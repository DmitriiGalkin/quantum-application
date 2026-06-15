import { Chat, ChatWithLastMessage } from '../entities/chat.js';
import { ChatRow, ChatWithLastMessageRow } from '../entities/chat.db.js';

export function mapChatRow(row: ChatRow): Chat {
  return {
    id: row.id,
    passportId: row.passportId,
    userId: row.userId,
    title: row.title,
    target: row.target,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    metadata: row.metadata
  };
}

export function mapChatWithLastMessage(row: ChatWithLastMessageRow): ChatWithLastMessage {
  return {
    ...mapChatRow(row),
    lastMessage: row.lastMessage,
    lastMessageAt: row.lastMessageAt,
    lastMessageRole: row.lastMessageRole,
  };
}
