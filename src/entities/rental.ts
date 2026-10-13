import type { PassportDto } from './passport.js';
import type { PlaceDto, PlaceScheduleDayDto } from './place.js';
import type { RoomDto } from './location.js';

export type RentalStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface CreateRental {
  locationId: number;
  startedAt: string;
  endedAt: string;
  participants: number;
  comment: string;
}

export interface Rental extends CreateRental {
  id: number;
  placeId: number;
  passportId: number;
  status: RentalStatus;
  rejectionReason: string | null;
  hourlyRate: number | null;
  estimatedTotal: number | null;
  createdAt: string;
}

export interface RentalDto extends Rental {
  locationTitle: string;
  placeTitle: string;
  applicant: PassportDto;
}

export interface BusyInterval {
  startedAt: string;
  endedAt: string;
}

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
