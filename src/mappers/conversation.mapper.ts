import type { Conversation, ConversationRow } from 'entities';

export function mapConversationRow(row: ConversationRow, passportId: number): Conversation {
  return {
    id: row.id,
    passportId,
    createdAt: row.createdAt,
  };
}