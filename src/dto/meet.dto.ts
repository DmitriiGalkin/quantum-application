import type { PassportDto, PlaceDto, UserDto } from 'dto/index.ts';
import type { Meet } from '../entities/meet.ts';

export interface MeetDto extends Omit<Meet, 'passportId' | 'placeId'> {
  users: UserDto[] | null;
  place: PlaceDto;
  passport: PassportDto;

  projectTitle?: string;
  isPaid?: boolean;
  // Общее количество участников проекта
  capacity: number;
}