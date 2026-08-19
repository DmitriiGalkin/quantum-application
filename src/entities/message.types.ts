import type { Role } from 'dto';

export type CreateMessageInput = {
  chatId: number;
  role: Role;
  content: string;
};
