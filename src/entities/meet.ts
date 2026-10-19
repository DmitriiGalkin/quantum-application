import type { RowDataPacket } from 'mysql2/promise';
import type { MeetStatus } from 'entities';
import type { UserDto } from './user.js';
import type { PassportDto } from './passport.js';
import type { PlaceDto } from './place.js';
import type { LocationDto } from './location.js';

export interface MeetRow extends RowDataPacket {
  bookingState?: 'requested' | 'awaiting_teacher' | 'confirmed' | 'needs_location';
  bookingRevision?: number;
  venuePrice?: number | null;
  venueHourlyRate?: number | null;
  venueQuoteVersion?: number;
  locationId: number | null;
  maxParticipants: number | null;
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId: number;
  status: MeetStatus;
}

export interface MeetWithProjectTitleRow extends MeetRow {
  title: string | null;
}

export interface Meet {
  bookingState?: 'requested' | 'awaiting_teacher' | 'confirmed' | 'needs_location';
  bookingRevision?: number;
  venuePrice?: number | null;
  venueHourlyRate?: number | null;
  venueQuoteVersion?: number;
  locationId: number | null;
  maxParticipants: number | null;
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId: number;
  status: MeetStatus;
}

export interface MeetWithProjectTitle extends Meet {
  title: string | null;
}

export interface MeetDto extends Omit<Meet, 'passportId' | 'placeId'> {
  users: UserDto[] | null;
  participantCount: number;
  place: PlaceDto;
  passport: PassportDto;

  projectTitle: string | null;
  projectImage: string | null;
  location: LocationDto | null;
  isPaid?: boolean;
  // Общее количество участников проекта
  capacity: number;
}

export type CreateMeetInput = {
  locationId?: number | null;
  venuePrice?: number | null;
  venueHourlyRate?: number | null;
  maxParticipants?: number | null;
  passportId: number;
  projectId: number;
  placeId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
};

export type UpdateMeetInput = Partial<{
  placeId: number;
  bookingState: 'requested' | 'awaiting_teacher' | 'confirmed' | 'needs_location';
  bookingRevision: number;
  venuePrice: number | null;
  venueHourlyRate: number | null;
  venueQuoteVersion: number;
  locationId: number | null;
  maxParticipants: number | null;
  startedAt: string;
  duration: number | null;
  price: number | null;
  status: MeetStatus;
}>;

export interface CreateMeet {
  locationId?: number | null;
  expectedVenueHourlyRate?: number;
  maxParticipants: number;
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
}

export type UpdateMeet = Omit<UpdateMeetInput, 'status' | 'bookingState' | 'bookingRevision' | 'venuePrice' | 'venueHourlyRate' | 'venueQuoteVersion'> & { reason?: string; expectedVenueHourlyRate?: number };

export interface GetMeetsQuery {
  userId?: number;
  passportId?: number;
  placeId?: number;
  projectId?: number;
}
