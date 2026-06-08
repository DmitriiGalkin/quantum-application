import { PassportDto } from '@shared/types';

export const toPassport = (row: any): PassportDto => ({
  id: row.id,
  title: row.title ?? null,
  users: row.users ?? [],
});
