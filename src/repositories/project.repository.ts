import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { ProjectRow, GetProjectsQuery, Project, CreateProjectInput, FindAllIdeaInput } from 'entities';
import { toProject } from '../mappers/project.mapper.js';
import { db } from '../utils/dbNext.js';

class ProjectRepository {
  static async findByIds(ids: number[]): Promise<Project[]> {
    if (!ids.length) return [];
    const rows = await db.query<ProjectRow>('SELECT * FROM project WHERE id IN (?)', [[...new Set(ids)]]);
    return rows.map(toProject);
  }
  static async moveSeedIdea(id: number, ideaId: number, conn: PoolConnection): Promise<void> {
    await conn.execute('UPDATE project SET ideaId = ? WHERE id = ?', [ideaId, id]);
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM project FOR UPDATE');
    return rows;
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM project WHERE id IN (?)', [ids]);
  }

  static async findIdsByPlaceId(placeId: number): Promise<number[]> {
    const rows = await db.query<{ id: number }>(
      'SELECT id FROM project WHERE placeId = ? AND deletedAt IS NULL',
      [placeId],
    );
    return rows.map(row => row.id);
  }

  // ✅ CREATE
  static async create(data: CreateProjectInput, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO project (ideaId, passportId, placeId, title, description, image, locationId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.ideaId || null, data.passportId, data.placeId, data.title, data.description, data.image, data.locationId ?? null],
    );

    return (Array.isArray(result) ? result[0] : result).insertId;
  }

  static async update(id: number, data: Partial<CreateProjectInput>, conn?: PoolConnection): Promise<boolean> {
    const keys = ['title', 'description', 'image', 'placeId', 'ideaId', 'locationId'] as const;
    const entries = keys.filter(key => data[key] !== undefined).map(key => [key, data[key]] as const);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    const result = await (conn ?? db).execute<ResultSetHeader>(`UPDATE project SET ${fields} WHERE id = ?`, [...values, id]);

    return (Array.isArray(result) ? result[0] : result).affectedRows > 0;
  }

  // ✅ DELETE (soft)
  static async delete(id: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? db).execute(`UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }

  // ✅ FIND ALL
  static async findAll(params: GetProjectsQuery = {}): Promise<Project[]> {
    const select: string[] = ['project.*'];
    const values: (string | number)[] = [];

    const lat = Number(params.latitude);
    const lng = Number(params.longitude);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    // 📍 DISTANCE (через project.placeId)
    if (params.sort === 'nearby' && hasCoords) {
      select.push(`
      (
        6371 * ACOS(
          COS(RADIANS(?)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) *
          SIN(RADIANS(pl.latitude))
        )
      ) AS distance
    `);

      values.push(lat, lng, lat);
    }

    let sql = `
      SELECT ${select.join(', ')}
      FROM project
             LEFT JOIN place pl ON pl.id = project.placeId
      WHERE 1=1
    `;

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

    // ✅ добавляем фильтр по ideaId
    if (params.ideaId) {
      sql += ' AND project.ideaId = ?';
      values.push(params.ideaId);
    }

    // ✅ добавляем фильтр по placeId
    if (params.placeId) {
      sql += ' AND project.placeId = ?';
      values.push(params.placeId);
    }

    // 📅 FILTER: when (через meet)
    if (params.when) {
      switch (params.when) {
        case 'today':
          sql += `
          AND EXISTS (
            SELECT 1
            FROM meet m
            WHERE m.projectId = project.id
              AND m.startedAt >= CURDATE()
              AND m.startedAt < CURDATE() + INTERVAL 1 DAY
          )
        `;
          break;

        case 'tomorrow':
          sql += `
          AND EXISTS (
            SELECT 1
            FROM meet m
            WHERE m.projectId = project.id
              AND m.startedAt >= CURDATE() + INTERVAL 1 DAY
              AND m.startedAt < CURDATE() + INTERVAL 2 DAY
          )
        `;
          break;
      }
    }

    sql += params.deleted === 'true' ? ' AND project.deletedAt IS NOT NULL' : ' AND project.deletedAt IS NULL';

    // 📍 FILTER + SORT: nearby
    if (params.sort === 'nearby' && hasCoords) {
      sql += `
      AND pl.latitude IS NOT NULL
      AND pl.longitude IS NOT NULL
    `;

      sql += ` ORDER BY distance ASC`;
    } else if (params.sort === 'new') {
      sql += ` ORDER BY project.createdAt DESC`;
    }

    const rows = await db.query<ProjectRow>(sql, values);

    return rows.map(toProject);
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

    return rows[0] ? toProject(rows[0]) : null;
  }

  // ✅ FIND BY IDEA
  static async findByIdeaId(ideaId: number, params?: FindAllIdeaInput): Promise<Project[]> {
    return this.findAll({ ...params, ideaId });
  }
}

export default ProjectRepository;
