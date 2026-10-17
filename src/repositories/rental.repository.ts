import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { Rental, RentalStatus, BusyInterval } from 'entities';
import { db } from '../utils/dbNext.js';

const rental = (row: Rental): Rental => ({ ...row, startedAt: new Date(row.startedAt).toISOString(),
  endedAt: new Date(row.endedAt).toISOString(), createdAt: new Date(row.createdAt).toISOString(),
  hourlyRate: row.hourlyRate == null ? null : Number(row.hourlyRate),
  estimatedTotal: row.estimatedTotal == null ? null : Number(row.estimatedTotal) });

export class RentalRepository {
  static async findById(id: number, conn?: PoolConnection): Promise<Rental | null> {
    const sql = 'SELECT * FROM placeRental WHERE id = ?' + (conn ? ' FOR UPDATE' : '');
    const rows = conn ? (await conn.query<(RowDataPacket & Rental)[]>(sql, [id]))[0] : await db.query<Rental>(sql, [id]);
    return rows[0] ? rental(rows[0]) : null;
  }

  static async list(field: 'passportId' | 'placeId', id: number): Promise<Rental[]> {
    return (await db.query<Rental>(`SELECT * FROM placeRental WHERE ${field} = ? ORDER BY startedAt DESC, id DESC`, [id])).map(rental);
  }

  static async create(data: Omit<Rental, 'id' | 'createdAt' | 'status' | 'rejectionReason'>, conn: PoolConnection): Promise<number> {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO placeRental (placeId, locationId, passportId, startedAt, endedAt, participants, comment, hourlyRate, estimatedTotal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.placeId, data.locationId, data.passportId, new Date(data.startedAt), new Date(data.endedAt), data.participants, data.comment, data.hourlyRate, data.estimatedTotal]);
    return result.insertId;
  }

  static async setStatus(id: number, status: RentalStatus, rejectionReason: string | null, conn: PoolConnection): Promise<void> {
    await conn.execute('UPDATE placeRental SET status = ?, rejectionReason = ? WHERE id = ?', [status, rejectionReason, id]);
  }

  static async conflicts(locationId: number, startedAt: string, endedAt: string, conn: PoolConnection): Promise<boolean> {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM placeRental WHERE locationId = ? AND status = 'confirmed' AND startedAt < ? AND endedAt > ? LIMIT 1",
      [locationId, new Date(endedAt), new Date(startedAt)]);
    return rows.length > 0;
  }

  static async hasFutureActive(locationId: number, conn: PoolConnection): Promise<boolean> {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM placeRental WHERE locationId = ? AND status IN ('pending', 'confirmed') AND endedAt > NOW() LIMIT 1", [locationId]);
    return rows.length > 0;
  }

  static async busy(locationId: number, startedAt: string, endedAt: string): Promise<BusyInterval[]> {
    const rows = await db.query<BusyInterval>(
      "SELECT startedAt, endedAt FROM placeRental WHERE locationId = ? AND status = 'confirmed' AND startedAt < ? AND endedAt > ? ORDER BY startedAt",
      [locationId, new Date(endedAt), new Date(startedAt)]);
    return rows.map(row => ({ startedAt: new Date(row.startedAt).toISOString(), endedAt: new Date(row.endedAt).toISOString() }));
  }
}
