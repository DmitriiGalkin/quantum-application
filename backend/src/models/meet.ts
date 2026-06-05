import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Meet } from '../../../application/src/types.js'; // Импортируем пул соединений

class MeetModel {
  static async create(data: Meet): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO meet (projectId, price, duration, startedAt) VALUES (?, ?, ?, ?)', [
        data.projectId,
        data.price,
        data.duration,
        data.startedAt,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('Meet.create error:', err);
      throw err;
    }
  }

  static async update(data: Meet): Promise<void> {
    try {
      await pool.query('UPDATE meet SET startedAt=?, duration=?, price=? WHERE id = ?', [data.startedAt, data.duration, data.price, data.id]);
    } catch (err) {
      console.error('Meet.update error:', err);
      throw err;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE id = ?', [id]);
    } catch (err) {
      console.error('Meet.delete error:', err);
      throw err;
    }
  }

  static async deleteByProjectId(projectId: string | number): Promise<void> {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE projectId = ?', [projectId]);
    } catch (err) {
      console.error('Meet.deleteByProjectId error:', err);
      throw err;
    }
  }

  static async findAll(): Promise<Meet[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT *
        FROM meet
        WHERE startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
      `,
        [],
      );
      return rows as Meet[];
    } catch (err) {
      console.error('Meet.findAll error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<Meet | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM meet WHERE id = ?', [id]);
      return rows.length > 0 ? (rows[0] as Meet) : null;
    } catch (err) {
      console.error('Meet.findById error:', err);
      throw err;
    }
  }

  static async findByPlaceId(id: number): Promise<Meet[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT meet.*, project.title
        FROM meet
        LEFT JOIN project ON project.id = meet.projectId
        WHERE meet.placeId = ?
      `,
        [id],
        
      );  console.log(rows, 'rows');    return rows as Meet[];
    } catch (err) {
      console.error('Meet.findByPlaceId error:', err);
      throw err;
    }
  }

  static async findByProjectId(projectId: string | number): Promise<Meet[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
      `,
        [projectId],
      );
      return rows as Meet[];
    } catch (err) {
      console.error('Meet.findByProjectId error:', err);
      throw err;
    }
  }

  static async findRecommendationByProjectId(projectId: string | number): Promise<Meet | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
        LIMIT 1
      `,
        [projectId],
      );
      return rows.length > 0 ? (rows[0] as Meet) : null;
    } catch (err) {
      console.error('Meet.findRecommendationByProjectId error:', err);
      throw err;
    }
  }

  static async findByUserId(userId: string | number): Promise<Meet[]> {
    try {
      const sql = `
        SELECT DISTINCT m.*
        FROM meet m
               JOIN projectUser p ON p.projectId = m.projectId
        WHERE p.userId = ?
          AND m.startedAt >= CURDATE()
          AND m.deletedAt IS NULL
        ORDER BY m.startedAt
      `;
      const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
      return rows as Meet[];
    } catch (err) {
      console.error('Meet.findByUserId error:', err);
      throw err;
    }
  }

  static async check(timer: { dayOfWeek: number; projectId: string | number }): Promise<{ dayOfWeek: number; projectId: string | number } | null> {
    try {
      // Корректировка дня недели для MySQL (1=Вс, ... ,7=Сб)
      const dayOfWeekForMySQL = timer.dayOfWeek === 0 ? 1 : timer.dayOfWeek + 1;

      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND DAYOFWEEK(startedAt) = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        LIMIT 1
      `,
        [timer.projectId, dayOfWeekForMySQL],
      );

      return rows.length === 0 ? timer : null;
    } catch (err) {
      console.error('Meet.check error:', err);
      throw err;
    }
  }
}

export default MeetModel;
