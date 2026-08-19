import type { RowDataPacket } from 'mysql2/promise';

export interface MeetUserRow extends RowDataPacket {
  id: number;
  userId: number;
  meetId: number;
}

export interface MeetUserWithMeetRow extends MeetUserRow {
  startedAt: Date | null;
}

export interface MeetUserFullRow extends RowDataPacket {
  id: number;
  userId: number;
  meetId: number;

  meetIdJoin: number | null;
  meetStartedAt: Date | null;
  meetProjectId: number | null;

  projectIdJoin: number | null;
  projectTitle: string | null;
  projectPlaceId: number | null;

  placeIdJoin: number | null;
  placeTitle: string | null;
  latitude: number | null;
  longitude: number | null;
}
