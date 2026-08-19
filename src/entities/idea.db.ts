import { RowDataPacket } from 'mysql2/promise';

export interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number;
  title: string;
  description: string;
  image: string | null;
  userCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface IdeaWithLikeRow extends IdeaRow {
  isLiked: 0 | 1; // MySQL boolean
}
