import type { RowDataPacket } from 'mysql2/promise';
import type { MeetDto } from './meet.js';

export interface PlaceRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  image: string | null;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
  priceFrom: number | null;
}

export interface Place {
  id: number;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
  priceFrom: number | null;
  image?: string | null;
}

export type CreatePlaceInput = {
  title: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  provider?: string | null;
  providerId?: number | null;
};

export type UpdatePlaceInput = Partial<{
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
  priceFrom: number | null;
}>;

export interface PlaceDto extends Omit<Place, 'provider' | 'providerId' | 'phone'> {
  meets?: MeetDto[];
  schedule?: PlaceScheduleDayDto[];
}

export interface PlaceDashboardDto {
  place: PlaceDto;
  stats: {
    teachers: number;
    projects: number;
    users: number;
    meets: number;
    pendingPlaceCount: number;
    incoming: number;
  };
}

export type PlaceScheduleDayDto = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export interface PlaceUpdateDto {
  id: number;
  title: string;
  description: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule: PlaceScheduleDayDto[];
}

export interface CreatePlace {
  title: string;
  description?: string;
  image?: string;
  address: string;
}