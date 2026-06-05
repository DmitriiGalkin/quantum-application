import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Idea } from '../../../application/src/types.js'; // Импортируем пул соединений

export interface IParams {
  variant?: 'participation' | 'self' | 'recommendation';
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
}

class IdeaModel {
  static async create(data: Idea): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO idea (`title`, `description`, `userId`, `passportId`) VALUES (?, ?, ?, ?)', [
        data.title,
        data.description,
        data.userId,
        data.passportId,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('idea.create error:', err);
      throw err;
    }
  }

  static async update(id: string | number, obj: Idea): Promise<void> {
    const sql = `
      UPDATE idea
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          image = COALESCE(?, image)
      WHERE id = ?
    `;
    const values = [obj.title, obj.description, obj.image, id];

    try {
      await pool.query(sql, values);
    } catch (err) {
      console.error('idea.update error:', err);
      throw err;
    }
  }

  static async delete(id: string | number): Promise<void> {
    const sql = 'UPDATE idea SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('idea.delete error:', err);
      throw err;
    }
  }

  static async findAll(params?: IParams): Promise<Idea[]> {
    let sql = 'SELECT idea.* FROM idea WHERE 1=1';
    const values: (string | number)[] = [];

    if (params?.variant === 'participation' && params?.userId) {
      sql += ' LEFT JOIN projectUser ON projectUser.projectId = idea.id AND projectUser.userId = ?';
      values.push(params.userId);
    }

    if (params?.variant === 'self' && params?.passportId) {
      sql += ' AND idea.passportId = ?';
      values.push(params.passportId);
    }

    if (params?.variant === 'recommendation' && params?.passportId) {
      sql += ' AND idea.passportId != ?';
      values.push(params.passportId);
    }

    if (params?.deleted === 'true') {
      sql += ' AND idea.deletedAt IS NOT NULL';
    } else {
      sql += ' AND idea.deletedAt IS NULL';
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, values);
      return rows as Idea[];
    } catch (err) {
      console.error('idea.findAll error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<Idea | null> {
    const sql = 'SELECT * FROM idea WHERE id = ?';

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
      return rows.length > 0 ? (rows[0] as Idea) : null;
    } catch (err) {
      console.error('idea.findById error:', err);
      throw err;
    }
  }
}

export default IdeaModel;