export interface Meet {
  id: number;
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: Date;
  placeId: number | null;
}

export interface MeetWithProjectTitle extends Meet {
  title: string | null;
}