import { ChatMessageRole, ChatTarget } from '@shared/types';

export interface Message {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string | null;
  metadata: Record<string, any> | null;
  target: ChatTarget | null;
  createdAt: Date;
}
