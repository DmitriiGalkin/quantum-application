import { RowDataPacket } from 'mysql2/promise';

export interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number | null;
  createdAt: Date;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
}

export interface IdeaWithLikeRow extends IdeaRow {
  isLiked: 0 | 1; // MySQL boolean
}
