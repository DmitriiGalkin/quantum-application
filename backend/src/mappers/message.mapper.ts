import { MessageRow } from '../models/message.repository.js';
import { ChatMessage, ChatMessageRole, ChatTarget } from '@shared/types';

export const toMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  chatId: row.chatId,
  passportId: row.passportId,
  role: row.role as ChatMessageRole,
  content: row.content,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
  target: row.target as ChatTarget,
  createdAt: row.createdAt,
});
