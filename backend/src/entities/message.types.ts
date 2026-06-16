import { Role } from '@shared/types';

export type CreateMessageInput = {
  chatId: number;
  passportId?: number | null;
  role: Role;
  content?: string | null;
};
