import type { Conversation, ConversationRow } from 'entities';

export function mapConversationRow(row: ConversationRow): Conversation {
  return {
    id: row.id,
    passportId: row.passportId, // This might need adjustment based on actual row structure
    createdAt: row.createdAt,
  };
}