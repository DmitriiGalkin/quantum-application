import type { PassportDto, PlaceDto, UserDto } from 'entities';
import type { Meet } from './meet.ts';

export interface MeetDto extends Omit<Meet, 'passportId' | 'placeId'> {
  users: UserDto[] | null;
  place: PlaceDto;
  passport: PassportDto;

  projectTitle?: string;
  isPaid?: boolean;
  // Общее количество участников проекта
  capacity: number;
}