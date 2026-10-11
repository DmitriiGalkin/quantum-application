import type { MeetDto } from 'entities';

export interface MeetManagement {
  placeId?: number;
  teacherId?: number;
}

export function canManageMeet(meet: MeetDto, management?: MeetManagement): boolean {
  return Boolean(management && (management.placeId === meet.place.id || management.teacherId === meet.passport.id));
}
