import { ResultSetHeader } from 'mysql2/promise';

import { ProjectUserRow } from '../entities/project-user.db.js';
import { mapProjectUserRow } from '../mappers/project-user.mapper.js';

import { ProjectUser } from '../entities/project-user.js';
import { CreateProjectUserInput } from '../entities/project-user.types.js';
import { db } from '../dbNext.js';

class ProjectUserRepository {
  // ✅ CREATE
  static async create(data: CreateProjectUserInput): Promise<number> {
    const result= await db.execute<ResultSetHeader>(
      `INSERT INTO projectUser (projectId, userId)
       VALUES (?, ?)`,
      [data.projectId, data.userId],
    );

    return result.insertId;
  }

  // ✅ DELETE BY ID
  static async delete(id: number): Promise<boolean> {
    const result= await db.execute<ResultSetHeader>(`DELETE FROM projectUser WHERE id = ?`, [id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE BY USER
  static async deleteByUserId(userId: number): Promise<void> {
    await db.execute(`DELETE FROM projectUser WHERE userId = ?`, [userId]);
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
