import type { MeetDto } from './meet.dto.ts';
import type { PlaceScheduleDayDto } from 'entities';
import type { Place } from './index.ts';

export interface PlaceDto extends Omit<Place, 'provider' | 'providerId' | 'phone'> {
  meets?: MeetDto[];
  schedule?: PlaceScheduleDayDto[];
}