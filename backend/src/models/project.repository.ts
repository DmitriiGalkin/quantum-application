import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

export interface ProjectRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  ideaId: number;
  passportId: number;
  deletedAt: string | null;
}

export interface ProjectParams {
  variant?: 'participation' | 'self' | 'recommendation';
  userId?: number;
  passportId?: number;
  deleted?: 'true' | 'false';
}


class ProjectRepository {
  // ✅ CREATE
  static async create(data: { title: string; description?: string | null; ideaId: number; passportId: number }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO project (title, description, ideaId, passportId)
       VALUES (?, ?, ?, ?)`,
      [data.title, data.description ?? null, data.ideaId, data.passportId],
    );

    return result.insertId;
  }

  // ✅ UPDATE
  static async update(id: number, data: Partial<ProjectRow>): Promise<void> {
    await pool.query(
      `UPDATE project
       SET title = COALESCE(?, title),
           description = COALESCE(?, description)
       WHERE id = ?`,
      [data.title, data.description, id],
    );
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await pool.query('UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?', [id]);
  }

  // 🔥 FIND ALL (исправленный builder)
  static async findAll(params?: ProjectParams): Promise<ProjectRow[]> {
    let sql = 'SELECT project.* FROM project';
    const values: number[] = [];
    const conditions: string[] = [];

    // 👉 JOIN
    if (params?.variant === 'participation' && params.userId) {
      sql += ' LEFT JOIN projectUser ON projectUser.projectId = project.id';
      conditions.push('projectUser.userId = ?');
      values.push(params.userId);
    }

    // 👉 фильтры
    if (params?.variant === 'self' && params.passportId) {
      conditions.push('project.passportId = ?');
      values.push(params.passportId);
    }

    if (params?.variant === 'recommendation' && params.passportId) {
      conditions.push('project.passportId != ?');
      values.push(params.passportId);
    }

    // 👉 deleted
    if (params?.deleted === 'true') {
      conditions.push('project.deletedAt IS NOT NULL');
    } else {
      conditions.push('project.deletedAt IS NULL');
    }

    // 👉 WHERE (фикс бага!)
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query<ProjectRow[]>(sql, values);
    return rows;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<ProjectRow | null> {
    const [rows] = await pool.query<ProjectRow[]>(
      `SELECT *
       FROM project
       WHERE id = ?
         AND deletedAt IS NULL`,
      [id],
    );

    return rows[0] ?? null;
  }

  // ✅ FIND BY IDEA
  static async findByIdeaId(ideaId: number): Promise<ProjectRow[]> {
    const [rows] = await pool.query<ProjectRow[]>(
      `SELECT *
       FROM project
       WHERE ideaId = ?
         AND deletedAt IS NULL`,
      [ideaId],
    );

    return rows;
  }
}

export default ProjectRepository;