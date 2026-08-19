import type { RowDataPacket } from 'mysql2/promise';

export interface PlaceRow extends RowDataPacket {
  id: number;
  title: string | null;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  image: string | null;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
  priceFrom: number | null;
}