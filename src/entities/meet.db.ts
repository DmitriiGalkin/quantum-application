import type { RowDataPacket } from 'mysql2/promise';
import type { MeetStatus } from 'dto';

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
