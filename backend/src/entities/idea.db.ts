import { RowDataPacket } from 'mysql2/promise';

export interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  deletedAt: Date | null;
}

export interface IdeaWithLikeRow extends IdeaRow {
  isLiked: 0 | 1; // MySQL boolean
}
