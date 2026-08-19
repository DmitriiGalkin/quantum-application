import { RowDataPacket } from 'mysql2/promise';
import { MeetStatus } from 'types';

export interface MeetRow extends RowDataPacket {
  id: number;
  projectId: number;
  passportId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId: number;
  status: MeetStatus;
}

export interface MeetWithProjectTitleRow extends MeetRow {
  title: string | null;
}
