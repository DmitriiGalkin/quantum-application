import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ProjectUser } from '@shared/types'; // Импортируем пул соединений

class ProjectUserModel {
  static async create(data: { userId: number; projectId: number }): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO `projectUser` (projectId, userId) VALUES (?, ?)',
        [data.projectId, data.userId]
      );
      return result.insertId;
    } catch (err) {
      console.error('ProjectUser.create error:', err);
      throw err;
    }
  }

  /**
   * Удаляет участие по ID.
   * @param {number} id - ID записи участия.
   * @returns {Promise<void>}
   */
  static async delete(id: string | number): Promise<void> {
    try {
      await pool.query('DELETE FROM projectUser WHERE id = ?', [id]);
    } catch (err) {
      console.error('ProjectUser.delete error:', err);
      throw err;
    }
  }

  /**
   * Удаляет все участия пользователя.
   * @param {string} userId - ID пользователя.
   * @returns {Promise<void>}
   */
  static async deleteByUserId(userId: string): Promise<void> {
    try {
      await pool.query('DELETE FROM projectUser WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('ProjectUser.deleteByUserId error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<ProjectUser | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM projectUser WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] as ProjectUser : null;
    } catch (err) {
      console.error('ProjectUser.findById error:', err);
      throw err;
    }
  }

  static async findByProjectId(projectId: string | number): Promise<ProjectUser[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM projectUser WHERE projectId = ?', [
        projectId,
      ]);
      return rows as ProjectUser[];
    } catch (err) {
      console.error('ProjectUser.findByProjectId error:', err);
      throw err;
    }
  }

  static async findByUserAndProjectIds(userId: string, projectId: string | number): Promise<ProjectUser | null> {
    try {
      const sql = 'SELECT * FROM projectUser WHERE userId = ? AND projectId = ?';
      const [rows] = await pool.query<RowDataPacket[]>(sql, [userId, projectId]);
      return rows.length > 0 ? (rows[0] as ProjectUser) : null;
    } catch (err) {
      console.error('ProjectUser.findByUserAndProjectIds error:', err);
      throw err;
    }
  }
}

export default ProjectUserModel;