import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// 👉 тип строки из БД
interface MeetRow extends RowDataPacket {
  id: number;
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  deletedAt: string | null;
  placeId?: number | null; // если есть в таблице
}

class MeetRepository {
  // ✅ CREATE
  static async create(data: { projectId: number; price: number; duration: number; startedAt: string }): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO meet (projectId, price, duration, startedAt)
         VALUES (?, ?, ?, ?)`,
        [data.projectId, data.price, data.duration, data.startedAt],
      );

      return result.insertId;
    } catch (err) {
      console.error('Meet.create error:', err);
      throw err;
    }
  }

  // ✅ UPDATE
  static async update(id: number, data: Partial<MeetRow>): Promise<void> {
    try {
      await pool.query(
        `UPDATE meet
         SET startedAt = COALESCE(?, startedAt),
             duration = COALESCE(?, duration),
             price = COALESCE(?, price)
         WHERE id = ?`,
        [data.startedAt, data.duration, data.price, id],
      );
    } catch (err) {
      console.error('Meet.update error:', err);
      throw err;
    }
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE id = ?', [id]);
    } catch (err) {
      console.error('Meet.delete error:', err);
      throw err;
    }
  }

  static async deleteByProjectId(projectId: number): Promise<void> {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE projectId = ?', [projectId]);
    } catch (err) {
      console.error('Meet.deleteByProjectId error:', err);
      throw err;
    }
  }

  // ✅ FIND ALL
  static async findAll(): Promise<MeetRow[]> {
    try {
      const [rows] = await pool.query<MeetRow[]>(
        `SELECT *
         FROM meet
         WHERE startedAt >= CURDATE()
           AND deletedAt IS NULL
         ORDER BY startedAt`,
      );

      return rows;
    } catch (err) {
      console.error('Meet.findAll error:', err);
      throw err;
    }
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<MeetRow | null> {
    try {
      const [rows] = await pool.query<MeetRow[]>('SELECT * FROM meet WHERE id = ?', [id]);

      return rows[0] ?? null;
    } catch (err) {
      console.error('Meet.findById error:', err);
      throw err;
    }
  }

  // ✅ FIND BY PLACE ID (с JOIN)
  static async findByPlaceId(id: number): Promise<(MeetRow & { title: string })[]> {
    try {
      const [rows] = await pool.query<(MeetRow & { title: string })[]>(
        `SELECT meet.*, project.title
         FROM meet
         LEFT JOIN project ON project.id = meet.projectId
         WHERE meet.placeId = ?`,
        [id],
      );

      return rows;
    } catch (err) {
      console.error('Meet.findByPlaceId error:', err);
      throw err;
    }
  }

  // ✅ FIND BY PROJECT ID
  static async findByProjectId(projectId: number): Promise<MeetRow[]> {
    try {
      const [rows] = await pool.query<MeetRow[]>(
        `SELECT *
         FROM meet
         WHERE projectId = ?
           AND startedAt >= CURDATE()
           AND deletedAt IS NULL
         ORDER BY startedAt`,
        [projectId],
      );

      return rows;
    } catch (err) {
      console.error('Meet.findByProjectId error:', err);
      throw err;
    }
  }

  // ✅ RECOMMENDATION (первый ближайший)
  static async findRecommendationByProjectId(projectId: number): Promise<MeetRow | null> {
    try {
      const [rows] = await pool.query<MeetRow[]>(
        `SELECT *
         FROM meet
         WHERE projectId = ?
           AND startedAt >= CURDATE()
           AND deletedAt IS NULL
         ORDER BY startedAt
         LIMIT 1`,
        [projectId],
      );

      return rows[0] ?? null;
    } catch (err) {
      console.error('Meet.findRecommendationByProjectId error:', err);
      throw err;
    }
  }

  // ✅ FIND BY USER ID (через JOIN)
  static async findByUserId(userId: number): Promise<MeetRow[]> {
    try {
      const [rows] = await pool.query<MeetRow[]>(
        `SELECT DISTINCT m.*
         FROM meet m
         JOIN projectUser p ON p.projectId = m.projectId
         WHERE p.userId = ?
           AND m.startedAt >= CURDATE()
           AND m.deletedAt IS NULL
         ORDER BY m.startedAt`,
        [userId],
      );

      return rows;
    } catch (err) {
      console.error('Meet.findByUserId error:', err);
      throw err;
    }
  }

  // ✅ CHECK (оставил твою логику, но типизировал)
  static async check(timer: { dayOfWeek: number; projectId: number }): Promise<typeof timer | null> {
    try {
      const dayOfWeekForMySQL = timer.dayOfWeek === 0 ? 1 : timer.dayOfWeek + 1;

      const [rows] = await pool.query<MeetRow[]>(
        `SELECT *
         FROM meet
         WHERE projectId = ?
           AND DAYOFWEEK(startedAt) = ?
           AND startedAt >= CURDATE()
           AND deletedAt IS NULL
         LIMIT 1`,
        [timer.projectId, dayOfWeekForMySQL],
      );

      return rows.length === 0 ? timer : null;
    } catch (err) {
      console.error('Meet.check error:', err);
      throw err;
    }
  }
}

export default MeetRepository;
