import { PassportExtendedDto } from '@shared/types';
import { Passport, PassportExtendedEntity } from '../entities/passport.js';
import { PassportRow } from '../entities/passport.db.js';

export function toPassport(row: PassportRow): Passport {
  return {
    id: row.id,
    providerId: row.providerId,
    provider: row.provider,
    accessToken: row.accessToken,
    title: row.title,
    description: row.description,
    email: row.email,
    image: row.image,
  };
}

export const toPassportDto = (row: PassportExtendedEntity): PassportExtendedDto => ({
  id: row.id,
  title: row.title ?? null,
  description: row.description ?? null,
  users: row.users ?? [],
});
