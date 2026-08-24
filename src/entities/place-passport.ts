import type { RowDataPacket } from 'mysql2/promise';

export type PlacePassportRole = 'admin' | 'teacher';

export interface PlacePassportRow extends RowDataPacket {
  id: number;
  placeId: number;
  passportId: number;
  role: PlacePassportRole;
  createdAt: string;
}