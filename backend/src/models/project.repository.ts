import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import { IParams } from '@shared/types';

export interface ProjectRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  ideaId: number;
  placeId: number;
  passportId: number;
  deletedAt: string | null;
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

  static async findAll(params: IParams = {}): Promise<ProjectRow[]> {
    let sql = 'SELECT project.* FROM project WHERE 1=1 ';
    const values: (string | number)[] = [];

    // участие пользователя (через projectUser)
    if (params.userId) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM projectUser pu
        WHERE pu.projectId = project.id
        AND pu.userId = ?
      )
    `;
      values.push(params.userId);
    }

    // проекты конкретного passport
    if (params.passportId) {
      sql += ' AND project.passportId = ?';
      values.push(params.passportId);
    }

    // deleted
    if (params.deleted === 'true') {
      sql += ' AND project.deletedAt IS NOT NULL';
    } else {
      sql += ' AND project.deletedAt IS NULL';
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