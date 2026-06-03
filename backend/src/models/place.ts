import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Place } from '../../../application/src/types'; // Импортируем пул соединений

class PlaceModel {
  static async create(data: Place): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO `place` (title, description) VALUES (?, ?, ?, ?)', [
        data.title,
        data.description,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('Place.create error:', err);
      throw err;
    }
  }

  static async findAll(): Promise<Place[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM place', []);
      return rows as Place[];
    } catch (err) {
      console.error('Place.findAll error:', err);
      throw err;
    }
  }

  static async findById(id: string): Promise<Place | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM place WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] as Place : null;
    } catch (err) {
      console.error('Place.findById error:', err);
      throw err;
    }
  }
}

export default PlaceModel;