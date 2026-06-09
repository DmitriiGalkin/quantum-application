import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { IParams } from '@shared/types';

export interface IdeaRow extends RowDataPacket {
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
  static async create(data: any): Promise<number> {
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

  static async findAll(params: IParams = {}) {
    const select: string[] = ['idea.*'];

    const values: (string | number)[] = [];

    // isLiked (только если есть пользователь)
    if (params.currentUserId) {
      select.push(`
      EXISTS (
        SELECT 1
        FROM ideaUser iu
        WHERE iu.ideaId = idea.id
        AND iu.userId = ?
      ) AS isLiked
    `);

      values.push(params.currentUserId);
    }

    let sql = `
    SELECT ${select.join(', ')}
    FROM idea
    WHERE 1=1
  `;

    // filters
    if (params.userId) {
      sql += ' AND idea.userId = ?';
      values.push(params.userId);
    }

    if (params.deleted === 'true') {
      sql += ' AND idea.deletedAt IS NOT NULL';
    } else {
      sql += ' AND idea.deletedAt IS NULL';
    }

    const [rows] = await pool.query<IdeaRow[]>(sql, values);
    return rows;
  }
  static async findById(id: string | number) {
    const sql = 'SELECT * FROM idea WHERE id = ?';

    try {
      const [rows] = await pool.query<IdeaRow[]>(sql, [id]);
      return rows[0] ?? null;
    } catch (err) {
      console.error('idea.findById error:', err);
      throw err;
    }
  }
}

export default IdeaRepository;
