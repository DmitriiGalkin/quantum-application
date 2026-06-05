import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Project } from '../../../application/src/types.js'; // Импортируем пул соединений

export interface IParams {
  variant?: 'participation' | 'self' | 'recommendation';
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
}

class ProjectModel {
  static async create(data: Project): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO `project` (`title`, `description`, `ideaId`, `passportId`) VALUES (?, ?, ?, ?)',
        [data.title, data.description, data.ideaId, data.passportId],
      );
      return result.insertId;
    } catch (err) {
      console.error('Project.create error:', err);
      throw err;
    }
  }

  static async update(id: string | number, obj: Project): Promise<void> {
    const sql = `
      UPDATE project 
      SET title = COALESCE(?, title), 
          description = COALESCE(?, description)
      WHERE id = ?
    `;
    const values = [obj.title, obj.description, id];

    try {
      await pool.query(sql, values);
    } catch (err) {
      console.error('Project.update error:', err);
      throw err;
    }
  }

  static async delete(id: string | number): Promise<void> {
    const sql = 'UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('Project.delete error:', err);
      throw err;
    }
  }

  static async findAll(params?: IParams): Promise<Project[]> {
    let sql = 'SELECT project.* FROM project';
    const values: (string | number)[] = [];

    if (params?.variant === 'participation' && params?.userId) {
      sql += ' LEFT JOIN projectUser ON projectUser.projectId = project.id';
      sql += ' AND projectUser.userId = ?';
      values.push(params.userId);
    }

    if (params?.variant === 'self' && params?.passportId) {
      sql += ' AND project.passportId = ?';
      values.push(params.passportId);
    }

    if (params?.variant === 'recommendation' && params?.passportId) {
      sql += ' AND project.passportId != ?';
      values.push(params.passportId);
    }

    // Условие для удаленных/активных проектов
    if (params?.deleted === 'true') {
      sql += ' AND project.deletedAt IS NOT NULL';
    } else {
      // По умолчанию ищем только не удаленные проекты
      sql += ' AND project.deletedAt IS NULL';
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, values);
      return rows as Project[];
    } catch (err) {
      console.error('Project.findAll error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<Project | null> {
    const sql = 'SELECT * FROM project WHERE id = ? AND deletedAt IS NULL'; // Не возвращаем логически удаленные

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
      return rows.length > 0 ? (rows[0] as Project) : null;
    } catch (err) {
      console.error('Project.findById error:', err);
      throw err;
    }
  }

  static async findByIdeaId(id: number): Promise<Project[]> {
    const sql = 'SELECT * FROM project WHERE ideaId = ? AND deletedAt IS NULL';

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
      return rows as Project[];
    } catch (err) {
      console.error('Project.findByIdeaId error:', err);
      throw err;
    }
  }
}

export default ProjectModel;