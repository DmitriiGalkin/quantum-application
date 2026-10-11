import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import type { ProjectUserRow, CreateProjectUserInput, ProjectUser } from 'entities';
import { mapProjectUserRow } from '../mappers/project-user.mapper.js';

import { db } from '../utils/dbNext.js';

class ProjectUserRepository {
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM projectUser FOR UPDATE');
    return rows;
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM projectUser WHERE id IN (?)', [ids]);
  }

  static async findByProjectIds(ids: number[]): Promise<ProjectUser[]> {
    if (!ids.length) return [];
    const rows = await db.query<ProjectUserRow>(
      'SELECT * FROM projectUser WHERE projectId IN (?)' + ' ORDER BY createdAt DESC',
      [[...new Set(ids)]],
    );
    return rows.map(mapProjectUserRow);
  }

  // ✅ CREATE
  static async create(data: CreateProjectUserInput, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO projectUser (projectId, userId)
       VALUES (?, ?)`,
      [data.projectId, data.userId],
    );

    return (Array.isArray(result) ? result[0] : result).insertId;
  }

  // ✅ DELETE BY ID
  static async delete(projectId: number, userId: number): Promise<boolean> {
    const result = await db.execute<ResultSetHeader>(`DELETE FROM projectUser WHERE projectId = ? AND userId = ?`, [projectId, userId]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE BY USER
  static async deleteByUserId(userId: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? db).execute(`DELETE FROM projectUser WHERE userId = ?`, [userId]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<ProjectUser | null> {
    const rows = await db.query<ProjectUserRow>(`SELECT * FROM projectUser WHERE id = ?`, [id]);

    return rows[0] ? mapProjectUserRow(rows[0]) : null;
  }

  // ✅ FIND BY PROJECT
  static async findByProjectId(projectId: number): Promise<ProjectUser[]> {
    const rows = await db.query<ProjectUserRow>(`SELECT * FROM projectUser WHERE projectId = ?`, [projectId]);

    return rows.map(mapProjectUserRow);
  }

  // ✅ FIND BY USER + PROJECT
  static async findByUserAndProjectIds(userId: number, projectId: number): Promise<ProjectUser | null> {
    const rows = await db.query<ProjectUserRow>(
      `SELECT *
       FROM projectUser
       WHERE userId = ? AND projectId = ?`,
      [userId, projectId],
    );

    return rows[0] ? mapProjectUserRow(rows[0]) : null;
  }
}

export default ProjectUserRepository;
