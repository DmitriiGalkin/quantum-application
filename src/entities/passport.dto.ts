import type { UserDto } from './user.dto.ts';
import type { PlaceDto } from './place.dto.ts';

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