import { RowDataPacket } from 'mysql2/promise';

export interface UserRow extends RowDataPacket {
  id: number;
  passportId: number;
  title: string;
  description: string;
  age: number;
  image: string | null;
  deletedAt: Date | null;
}

export interface UserWithMeetRow extends UserRow {
  meetUserId: number;
}


// Ваня, 10 лет, увлекается рисованием и игрой на скрипке