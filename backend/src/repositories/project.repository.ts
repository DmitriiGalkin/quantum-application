import { ResultSetHeader } from 'mysql2/promise';
import { ProjectRow } from '../entities/project.db.js';
import { mapProjectRow } from '../mappers/project.mapper.js';
import { FindAllProjectInput, Project } from '../entities/project.js';
import { CreateProjectInput } from '../entities/project.types.js';
import { db } from '../dbNext.js';

class ProjectRepository {
  // ✅ CREATE
  static async create(data: CreateProjectInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO project (ideaId, passportId)
       VALUES (?, ?)`,
      [ data.ideaId, data.passportId],
    );

    return result.insertId;
  }

  // ✅ UPDATE
  // static async update(id: number, data: UpdateProjectInput): Promise<boolean> {
  //   const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  //
  //   if (entries.length === 0) return false;
  //
  //   const fields = entries.map(([k]) => `${k} = ?`).join(', ');
  //   const values = entries.map(([, v]) => v);
  //
  //   const result = await db.execute<ResultSetHeader>(`UPDATE project SET ${fields} WHERE id = ?`, [...values, id]);
  //
  //   return result.affectedRows > 0;
  // }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }

  // ✅ FIND ALL
  static async findAll(params: FindAllProjectInput = {}): Promise<Project[]> {
    let sql = `SELECT project.* FROM project WHERE 1=1`;
    const values: (string | number)[] = [];

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

    if (params.passportId) {
      sql += ' AND project.passportId = ?';
      values.push(params.passportId);
    }

    sql += params.deleted === 'true' ? ' AND project.deletedAt IS NOT NULL' : ' AND project.deletedAt IS NULL';

    const rows = await db.query<ProjectRow>(sql, values);

    return rows.map(mapProjectRow);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Project | null> {
    const rows = await db.query<ProjectRow>(
      `SELECT *
       FROM project
       WHERE id = ?
         AND deletedAt IS NULL`,
      [id],
    );

    return rows[0] ? mapProjectRow(rows[0]) : null;
  }

  // ✅ FIND BY IDEA
  static async findByIdeaId(ideaId: number): Promise<Project[]> {
    const rows = await db.query<ProjectRow>(
      `SELECT *
       FROM project
       WHERE ideaId = ?
         AND deletedAt IS NULL`,
      [ideaId],
    );

    return rows.map(mapProjectRow);
  }
}

export default ProjectRepository;
