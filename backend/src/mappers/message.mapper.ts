import { MessageDto, ChatMessageRole, ChatTarget } from '@shared/types';
import { Message } from '../entities/message.js';
import { MessageRow } from '../entities/message.db.js';

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    chatId: row.chatId,
    passportId: row.passportId,
    role: row.role,
    content: row.content,
    metadata: row.metadata ? safeParse(row.metadata) : null,
    target: row.target,
    createdAt: row.createdAt,
  };
}

export const toMessage = (row: Message): MessageDto => ({
  id: row.id,
  chatId: row.chatId,
  passportId: row.passportId,
  role: row.role as ChatMessageRole,
  content: row.content,
  metadata: row.metadata,
  target: row.target as ChatTarget,
  //createdAt: row.createdAt,
});


// 👇 безопасный парсинг (обязательно!)
function safeParse(json: string): Record<string, any> | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}