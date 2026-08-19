import type { RowDataPacket } from 'mysql2/promise';

export interface UserRow extends RowDataPacket {
  id: number;
  passportId: number;
  title: string;
  description: string;
  age: number | null;
  image: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface UserWithMeetRow extends UserRow {
  meetUserId: number;
}
