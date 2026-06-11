import { RowDataPacket } from 'mysql2/promise';

export interface PlaceRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  provider: string | null;
  providerId: number | null;
  address: string | null;
  phone: string | null;
}