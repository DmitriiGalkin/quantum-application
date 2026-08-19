import { Role } from 'types';

export type CreateMessageInput = {
  chatId: number;
  role: Role;
  content: string;
};
