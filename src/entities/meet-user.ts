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

export interface MeetUser {
  id: number;
  userId: number;
  meetId: number;
}

export interface MeetUserWithMeet extends MeetUser {
  startedAt: Date | null;
}

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

export interface CreateMeetUser {
  meetId: number;
  userId: number;
}
export interface DeleteMeetUser {
  meetId: number;
  userId: number;
}