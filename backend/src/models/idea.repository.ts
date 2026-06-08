import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { IParams } from '@shared/types';

interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  deletedAt: string | null;
}

class IdeaRepository {
  // ✅ CREATE
  static async create(data: IdeaRow): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO idea (title, description, userId, passportId)
         VALUES (?, ?, ?, ?)`,
        [data.title, data.description, data.userId, data.passportId],
      );

      return result.insertId;
    } catch (err) {
      console.error('idea.create error:', err);
      throw err;
    }
  }

  // ✅ UPDATE
  static async update(id: number, obj: Partial<IdeaRow>): Promise<void> {
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

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    try {
      await pool.query('UPDATE idea SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?', [id]);
    } catch (err) {
      console.error('idea.delete error:', err);
      throw err;
    }
  }

  // ✅ FIND ALL (без any и без кастов)
  static async findAll(params?: IParams): Promise<IdeaRow[]> {
    let sql = 'SELECT idea.* FROM idea';
    const values: (string | number)[] = [];

    if (params?.variant === 'participation' && params?.userId) {
      sql += `
        LEFT JOIN projectUser 
        ON projectUser.projectId = idea.id 
        AND projectUser.userId = ?
      `;
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
      const [rows] = await pool.query<IdeaRow[]>(sql, values);
      return rows;
    } catch (err) {
      console.error('idea.findAll error:', err);
      throw err;
    }
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<IdeaRow | null> {
    try {
      const [rows] = await pool.query<IdeaRow[]>('SELECT * FROM idea WHERE id = ?', [id]);

      return rows[0] ?? null;
    } catch (err) {
      console.error('idea.findById error:', err);
      throw err;
    }
  }
}

export default IdeaRepository;
