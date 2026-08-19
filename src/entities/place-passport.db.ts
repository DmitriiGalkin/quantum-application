import type { RowDataPacket } from 'mysql2/promise';

export type Role = 'admin' | 'teacher';

export interface PlacePassportRow extends RowDataPacket {
  id: number
  placeId: number
  passportId: number
  role: Role
  createdAt: string
}