import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IdeaUser } from '../../../application/src/types'; // Импортируем пул соединений

class IdeaUserModel {
  static async create(data: { userId: string | number; ideaId: string | number }): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO `ideaUser` (ideaId, userId) VALUES (?, ?)', [
        data.ideaId,
        data.userId,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('IdeaUser.create error:', err);
      throw err;
    }
  }

  static async delete(id: string | number): Promise<void> {
    try {
      await pool.query('DELETE FROM ideaUser WHERE id = ?', [id]);
    } catch (err) {
      console.error('IdeaUser.delete error:', err);
      throw err;
    }
  }

  static async deleteByUserId(userId: string | number): Promise<void> {
    try {
      await pool.query('DELETE FROM ideaUser WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('IdeaUser.deleteByUserId error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<IdeaUser | null> {
    try {
      const [rows]= await pool.query<RowDataPacket[]>('SELECT * FROM ideaUser WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] as IdeaUser : null;
    } catch (err) {
      console.error('IdeaUser.findById error:', err);
      throw err;
    }
  }

  static async findByIdeaId(ideaId: string | number): Promise<IdeaUser[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ideaUser WHERE ideaId = ?', [ideaId]);
      return rows as IdeaUser[];
    } catch (err) {
      console.error('IdeaUser.findByIdeaId error:', err);
      throw err;
    }
  }
}

export default IdeaUserModel;
