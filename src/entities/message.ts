import { Role } from 'types';

export interface Message {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string | null;
}
