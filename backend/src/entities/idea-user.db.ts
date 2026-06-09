import { RowDataPacket } from 'mysql2/promise';

export interface IdeaUserRow extends RowDataPacket {
  id: number;
  ideaId: number;
  userId: number;
}
