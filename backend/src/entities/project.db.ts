import { RowDataPacket } from 'mysql2/promise';

export interface ProjectRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  ideaId: number;
  placeId: number | null;
  passportId: number;
  deletedAt: Date | null;
}
