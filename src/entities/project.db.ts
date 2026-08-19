import type { RowDataPacket } from 'mysql2/promise';

export interface ProjectRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image: string | null;
  ideaId: number | null;
  placeId: number;
  passportId: number;
  createdAt: string;
  deletedAt: string;
}
