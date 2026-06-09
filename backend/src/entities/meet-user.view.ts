export interface MeetUserFull {
  id: number;
  userId: number;
  meetId: number;

  meet: {
    id: number;
    startedAt: Date | null;

    project: {
      id: number;
      title: string | null;

      place: {
        id: number;
        title: string | null;
        latitude: number | null;
        longitude: number | null;
      } | null;
    } | null;
  } | null;
}
