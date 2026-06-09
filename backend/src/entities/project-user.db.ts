import { RowDataPacket } from 'mysql2/promise';

export interface ProjectUserRow extends RowDataPacket {
  id: number;
  projectId: number;
  userId: number;
}
