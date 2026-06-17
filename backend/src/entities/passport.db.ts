import { RowDataPacket } from 'mysql2/promise';

export interface PassportRow extends RowDataPacket {
  id: number;
  providerId: string;
  provider: string;
  accessToken: string;
  title: string;
  email: string;
  image: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
