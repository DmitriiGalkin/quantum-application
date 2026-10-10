import type { PlaceScheduleDayDto } from 'entities';

export const DEFAULT_PLACE_SCHEDULE: PlaceScheduleDayDto[] = [
  { weekday: 1, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 2, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 3, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 4, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 5, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 6, enabled: true, startTime: '10:00', endTime: '18:00' },
  { weekday: 0, enabled: false, startTime: '09:00', endTime: '21:00' },
];

