import { RowDataPacket } from 'mysql2/promise';

import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

export interface ProjectUserRow extends RowDataPacket {
  id: number;
  projectId: number;
  userId: number;
}

class ProjectUserRepository {
  // ✅ CREATE
  static async create(data: { userId: number; projectId: number }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO projectUser (projectId, userId) VALUES (?, ?)', [data.projectId, data.userId]);

    return result.insertId;
  }

  // ✅ DELETE BY ID
  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM projectUser WHERE id = ?', [id]);
  }

  // ✅ DELETE BY USER
  static async deleteByUserId(userId: number): Promise<void> {
    await pool.query('DELETE FROM projectUser WHERE userId = ?', [userId]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<ProjectUserRow | null> {
    const [rows] = await pool.query<ProjectUserRow[]>('SELECT * FROM projectUser WHERE id = ?', [id]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY PROJECT
  static async findByProjectId(projectId: number): Promise<ProjectUserRow[]> {
    const [rows] = await pool.query<ProjectUserRow[]>('SELECT * FROM projectUser WHERE projectId = ?', [projectId]);

    return rows;
  }

  // ✅ FIND BY USER + PROJECT
  static async findByUserAndProjectIds(userId: number, projectId: number): Promise<ProjectUserRow | null> {
    const [rows] = await pool.query<ProjectUserRow[]>('SELECT * FROM projectUser WHERE userId = ? AND projectId = ?', [userId, projectId]);

    return rows[0] ?? null;
  }
}

export default ProjectUserRepository;