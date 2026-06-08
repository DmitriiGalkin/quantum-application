import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

interface PlaceRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

class PlaceRepository {
  // ✅ CREATE
  static async create(data: { title: string; description?: string | null; latitude?: number | null; longitude?: number | null }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO place (title, description, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [data.title, data.description ?? null, data.latitude ?? null, data.longitude ?? null],
    );

    return result.insertId;
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
}

export default PlaceRepository;
