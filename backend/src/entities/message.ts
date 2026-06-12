import { ChatMessageRole, ChatTarget } from '@shared/types';

export interface Message {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string | null;
  metadata: any;
  target: ChatTarget | null;
  createdAt: Date;
  data?: any
}
