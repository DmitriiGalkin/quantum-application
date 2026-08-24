import type { MeetDto } from 'dto/meet.dto.ts';
import type { PlaceScheduleDayDto } from 'dto/index.ts';
import type { Place } from '../entities';

export interface PlaceDto extends Omit<Place, 'provider' | 'providerId' | 'phone'> {
  meets?: MeetDto[];
  schedule?: PlaceScheduleDayDto[];
}