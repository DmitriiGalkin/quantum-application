import { PassportDto } from '@shared/types';

export const toPassport = (row: any): PassportDto => ({
  id: row.id,
  title: row.title ?? null,
  description: row.description ?? null,
  users: row.users ?? [],
});
