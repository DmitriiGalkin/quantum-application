import { RowDataPacket } from 'mysql2/promise';

export interface PassportRow extends RowDataPacket {
  id: number;
  providerId: string;
  provider: string;
  accessToken: string;
  title: string;
  description: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string | null;
}
