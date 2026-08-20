import type { Passport } from '../entities/passport.js';
import type { PassportRow } from '../entities/passport.db.js';

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
