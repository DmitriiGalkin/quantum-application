import { Role } from '@shared/types';

export type CreateMessageInput = {
  chatId: number;
  role: Role;
  content: string;
};
