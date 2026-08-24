import type { Place, PlaceRow } from 'entities';

export function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    provider: row.provider,
    providerId: row.providerId,
    phone: row.phone,
    priceFrom: row.priceFrom,
  };
}