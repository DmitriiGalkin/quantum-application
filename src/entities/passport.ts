import type { RowDataPacket } from 'mysql2/promise';
import type { User, UserDto } from './user.js';
import type { Place, PlaceDto } from './place.js';

export interface PassportRow extends RowDataPacket {
  id: number;
  providerId: string;
  provider: string;
  accessToken: string;
  title: string;
  description: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PassportDto {
  id: number;
  title: string;
  description: string | null;
  image?: string | null;
}

export interface PassportExtendedDto extends PassportDto {
  users: UserDto[];
  places: PlaceDto[];
  isTeacher: boolean;
}

export interface Passport {
  id: number;
  providerId: string;
  provider: string;
  description: string | null;
  accessToken: string;
  title: string;
  image: string | null;
  email: string;
}

export interface PassportExtendedEntity extends Passport {
  users: User[];
  place: Place | null;
}

export type CreatePassportInput = {
  providerId: string;
  provider: string;
  accessToken: string;
  title?: string | null;
  email: string;
  image: string | null;
};

export type UpdatePassportInput = Partial<{
  title: string | null;
  description: string | null;
}>;