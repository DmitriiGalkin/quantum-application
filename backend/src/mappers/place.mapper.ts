import type { Place } from '../entities/place.js';
import type { PlaceDto } from '@shared/types';

export function mapPlaceRow(row): Place {
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
  };
}

export function toPlaceDto(place: Place): PlaceDto {
  return {
    id: place.id,
    title: place.title,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    image: null, // или логика

    meets: [], // подтягивается отдельно
  };
}