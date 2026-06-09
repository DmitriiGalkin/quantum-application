import { PassportDto } from '@shared/types';
import { Passport } from '../entities/passport.js';
import { PassportRow } from '../entities/passport.db.js';

export function mapPassportRow(row: PassportRow): Passport {
  return {
    id: row.id,
    providerId: row.providerId,
    provider: row.provider,
    accessToken: row.accessToken,
    title: row.title,
    email: row.email,
  };
}

export const toPassport = (row: any): PassportDto => ({
  id: row.id,
  title: row.title ?? null,
  description: row.description ?? null,
  users: row.users ?? [],
});
