import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

interface PlaceRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  provider: string | null;
  providerId: number | null;
  address: string | null;
  phone: string | null;
}

class PlaceRepository {
  // ✅ CREATE
  static async create(data: {
    title: string;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    provider?: string | null;
    providerId?: number | null;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO place (title, description, latitude, longitude, address, provider, providerId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description ?? null,
        data.latitude ?? null,
        data.longitude ?? null,
        data.address ?? null,
        data.provider ?? null,
        data.providerId ?? null,
      ],
    );

    return result.insertId;
  }

  // ✅ UPDATE
  static async update(
    id: number,
    data: {
      title?: string;
      description?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      address?: string | null;
      provider?: string | null;
      providerId?: number | null;
      phone?: string | null;
      priceFrom?: number | null;
    },
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }

    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (data.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(data.latitude);
    }

    if (data.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(data.longitude);
    }

    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }

    if (data.provider !== undefined) {
      fields.push('provider = ?');
      values.push(data.provider);
    }

    if (data.providerId !== undefined) {
      fields.push('providerId = ?');
      values.push(data.providerId);
    }

    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }

    if (data.priceFrom !== undefined) {
      fields.push('priceFrom = ?');
      values.push(data.priceFrom);
    }

    // ❗ если нечего обновлять
    if (fields.length === 0) {
      return false;
    }

    const sql = `UPDATE place SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(sql, values);

    return result.affectedRows > 0;
  }

  // ✅ FIND ALL
  static async findAll(): Promise<PlaceRow[]> {
    const [rows] = await pool.query<PlaceRow[]>('SELECT * FROM place');

    return rows;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<PlaceRow | null> {
    const [rows] = await pool.query<PlaceRow[]>('SELECT * FROM place WHERE id = ?', [id]);

    return rows[0] ?? null;
  }

  // ✅ FIND MOS.RU
  static async findMOSRU(): Promise<PlaceRow[]> {
    const [rows] = await pool.query<PlaceRow[]>('SELECT * FROM place WHERE place.provider = "mos.ru" AND place.phone IS NULL ');

    return rows;
  }
}

export default PlaceRepository;
