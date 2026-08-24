import type { Passport, PassportRow } from 'entities';

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
