import type { RowDataPacket } from 'mysql2/promise';

export interface TeacherUserRow extends RowDataPacket {
  id: number;
  teacherId: number;
  userId: number;
  createdAt: string;
}
