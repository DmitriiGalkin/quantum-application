import { ChatMessageRole, ChatTarget } from '@shared/types';

export type CreateMessageInput = {
  chatId: number;
  passportId?: number | null;
  role: ChatMessageRole;
  content?: string | null;
  metadata?: string | null;
  target?: ChatTarget | null;
};

export type UpdateMessageInput = Partial<{
  content: string | null;
  metadata: string | null;
}>;
