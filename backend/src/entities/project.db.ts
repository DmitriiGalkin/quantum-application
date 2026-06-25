import { RowDataPacket } from 'mysql2/promise';

export interface ProjectRow extends RowDataPacket {
  id: number;
  ideaId: number | null;
  placeId: number;
  passportId: number;
  createdAt: string;
  deletedAt: string;
}
