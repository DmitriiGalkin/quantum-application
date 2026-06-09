import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

import { mapPlaceRow, type PlaceRow } from '../mappers/place.mapper.js';
import { CreatePlaceInput, Place, UpdatePlaceInput } from '../entities/place.js';

class PlaceRepository {
  // ✅ CREATE
  static async create(data: CreatePlaceInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO place
       (title, description, latitude, longitude, address, provider, providerId)
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

  // ✅ UPDATE (универсальный)
  static async update(id: number, data: UpdatePlaceInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const [result] = await pool.query<ResultSetHeader>(`UPDATE place SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ FIND ALL
  static async findAll(): Promise<Place[]> {
    const [rows] = await pool.query<PlaceRow[]>('SELECT * FROM place');

    return rows.map(mapPlaceRow);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Place | null> {
    const [rows] = await pool.query<PlaceRow[]>('SELECT * FROM place WHERE id = ?', [id]);

    if (!rows[0]) return null;

    return mapPlaceRow(rows[0]);
  }

  // ✅ FIND MOS.RU
  static async findMOSRU(): Promise<Place[]> {
    const [rows] = await pool.query<PlaceRow[]>(
      `SELECT * 
       FROM place 
       WHERE provider = ? 
         AND phone IS NULL`,
      ['mos.ru'],
    );

    return rows.map(mapPlaceRow);
  }
}

export default PlaceRepository;
