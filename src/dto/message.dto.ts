import type { Role } from 'dto/index.ts';

export type MessageDto = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string;
};