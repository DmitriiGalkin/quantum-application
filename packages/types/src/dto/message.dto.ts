import { Role } from '../index';

export type MessageDto = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string;
};
