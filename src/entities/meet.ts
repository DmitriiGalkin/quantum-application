import type { RowDataPacket } from 'mysql2/promise';
import type { MeetStatus } from 'entities';
import type { UserDto } from './user.js';
import type { PassportDto } from './passport.js';
import type { PlaceDto } from './place.js';

export interface MeetRow extends RowDataPacket {
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
  place: PlaceDto;
  passport: PassportDto;

  projectTitle?: string;
  isPaid?: boolean;
  // Общее количество участников проекта
  capacity: number;
}

export type CreateMeetInput = {
  passportId: number;
  projectId: number;
  placeId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
};

export type UpdateMeetInput = Partial<{
  startedAt: string;
  duration: number | null;
  price: number | null;
  status: MeetStatus;
}>;

export interface CreateMeet {
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
}

export interface UpdateMeet {
  price: number | null;
  duration: number | null;
  startedAt: string;
  projectId: number;
}

export interface GetMeetsQuery {
  userId?: number;
  passportId?: number;
  placeId?: number;
  projectId?: number;
}