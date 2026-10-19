import type { PassportDto } from './passport.js';
import type { PlaceDto, PlaceScheduleDayDto } from './place.js';
import type { RoomDto } from './location.js';

export interface PublicMeet {
  id: number;
  projectId: number;
  projectTitle: string | null;
  teacher: PassportDto;
  locationTitle: string | null;
  startedAt: string;
  duration: number | null;
  price: number | null;
  availableSeats: number | null;
}

export interface PlaceProfile {
  place: Omit<PlaceDto, 'meets' | 'schedule'> & { phone: string | null };
  schedule: PlaceScheduleDayDto[];
  rooms: RoomDto[];
  teachers: PassportDto[];
  meets: PublicMeet[];
}
