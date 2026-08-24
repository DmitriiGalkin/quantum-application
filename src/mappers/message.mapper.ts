import type { MessageDto, Message, MessageRow } from 'entities';

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    chatId: row.chatId,
    passportId: row.passportId,
    role: row.role,
    content: row.content,
  };
}

export const toMessageDto = (row: Message): MessageDto => ({
  id: row.id,
  chatId: row.chatId,
  passportId: row.passportId,
  role: row.role,
  content: row.content || '',
});
