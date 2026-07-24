export interface PlaceSchedule {
  id: number;
  placeId: number;
  weekday: number;

  enabled: boolean;

  startTime: string;
  endTime: string;
}
