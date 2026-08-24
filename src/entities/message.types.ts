import type { Role } from 'entities';

export type CreateMessageInput = {
  chatId: number;
  role: Role;
  content: string;
};
