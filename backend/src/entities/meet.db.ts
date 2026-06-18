import { RowDataPacket } from 'mysql2/promise';

export interface MeetRow extends RowDataPacket {
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId: number | null;
}

export interface MeetWithProjectTitleRow extends MeetRow {
  title: string | null;
}
