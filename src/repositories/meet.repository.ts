import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {GetMeetsQuery, MeetStatus, MeetRow, MeetWithProjectTitleRow, CreateMeetInput, UpdateMeetInput, Meet, MeetWithProjectTitle } from 'entities';
import { mapMeetWithProjectTitle, toMeet } from '../mappers/meet.mapper.js';
import { db } from '../utils/dbNext.js';

class MeetRepository {
  static async findIdsByPlaceId(placeId: number): Promise<number[]> {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM meet WHERE placeId = ? AND deletedAt IS NULL AND status <> 'cancelled'",
      [placeId],
    );
    return rows.map(row => row.id);
  }

  static async getPlaceStats(placeId: number): Promise<{ meets: number; pendingPlaceCount: number }> {
    const [row] = await db.query<{ meets: number | null; pendingPlaceCount: number | null }>(
      `SELECT
         SUM(status <> 'cancelled'
             AND startedAt >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
             AND startedAt < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) + INTERVAL 7 DAY) AS meets,
         SUM(status = 'pending' AND startedAt > NOW()) AS pendingPlaceCount
       FROM meet WHERE placeId = ? AND deletedAt IS NULL`,
      [placeId],
    );
    return { meets: Number(row.meets ?? 0), pendingPlaceCount: Number(row.pendingPlaceCount ?? 0) };
  }

  static async findByProjectIds(ids: number[], futureOnly = false): Promise<Meet[]> {
    if (!ids.length) return [];
    const rows = await db.query<MeetRow>(
      'SELECT * FROM meet WHERE projectId IN (?)' + (futureOnly ? ' AND deletedAt IS NULL AND startedAt > NOW()' : '') + ' ORDER BY startedAt',
      [[...new Set(ids)]],
    );
    return rows.map(toMeet);
  }

  static async create(data: CreateMeetInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO meet (passportId, projectId, price, duration, startedAt, placeId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.passportId, data.projectId, data.price, data.duration, data.startedAt, data.placeId],
    );

    return result.insertId;
  }

  // ✅ UPDATE (нормальный partial)
  static async update(id: number, data: UpdateMeetInput): Promise<boolean> {
    const keys = ['startedAt', 'duration', 'price', 'status'] as const;
    const entries = keys.filter(key => data[key] !== undefined).map(key => [key, data[key]] as const);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    const result = await db.execute<ResultSetHeader>(`UPDATE meet SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE meet SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  static async deleteByProjectId(projectId: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? db).execute(`UPDATE meet SET deletedAt = NOW() WHERE projectId = ?`, [projectId]);
  }

  // ✅ FIND ALL
  static async findAll(data: GetMeetsQuery): Promise<Meet[]> {
    const params: unknown[] = [];
    let sql = `
      SELECT meet.*
      FROM meet
    `;

    const needProjectJoin = !!data.passportId;
    const needUserJoin = !!data.userId;

    if (needProjectJoin) {
      sql += ` INNER JOIN project ON project.id = meet.projectId `;
    }

    if (needUserJoin) {
      sql += ` INNER JOIN meetUser ON meetUser.meetId = meet.id `;
    }

    // Добавлено условие: только будущие и неудаленные встречи
    sql += ` WHERE meet.deletedAt IS NULL AND meet.startedAt > NOW() `;

    if (data.passportId) {
      sql += ` AND meet.passportId = ? `;
      params.push(data.passportId);
    }

    if (data.projectId) {
      sql += ` AND meet.projectId = ? `;
      params.push(data.projectId);
    }

    if (data.userId) {
      sql += ` AND meetUser.userId = ? `;
      params.push(data.userId);
    }

    if (data.placeId) {
      sql += ` AND meet.placeId = ? `;
      params.push(data.placeId);
    }

    sql += ` ORDER BY meet.startedAt `;

    const rows = await db.query<MeetRow>(sql, params);
    return rows.map(toMeet);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Meet | null> {
    const rows = await db.query<MeetRow>(`SELECT * FROM meet WHERE id = ?`, [id]);

    return rows[0] ? toMeet(rows[0]) : null;
  }

  // ✅ FIND BY PLACE ID (JOIN)
  static async findByPlaceId(id: number): Promise<MeetWithProjectTitle[]> {
    const rows = await db.query<MeetWithProjectTitleRow>(
      `SELECT meet.*
       FROM meet
       LEFT JOIN project ON project.id = meet.projectId
       WHERE meet.placeId = ?`,
      [id],
    );

    return rows.map(mapMeetWithProjectTitle);
  }

  // ✅ FIND BY PROJECT ID
  static async findByProjectId(projectId: number, includeDeleted = false): Promise<Meet[]> {
    const rows = await db.query<MeetRow>(
      `
        SELECT *
        FROM meet
        WHERE projectId = ?
          ${includeDeleted ? '' : 'AND deletedAt IS NULL'}
        ORDER BY startedAt
      `,
      [projectId],
    );

    return rows.map(toMeet);
  }

  // ✅ RECOMMENDATION
  static async findRecommendationByProjectId(projectId: number): Promise<Meet | null> {
    const rows = await db.query<MeetRow>(
      `SELECT *
       FROM meet
       WHERE projectId = ?
         AND startedAt >= CURDATE()
         AND deletedAt IS NULL
       ORDER BY startedAt
       LIMIT 1`,
      [projectId],
    );

    return rows[0] ? toMeet(rows[0]) : null;
  }

  // ✅ FIND BY USER ID
  static async findByUserId(userId: number): Promise<Meet[]> {
    const rows = await db.query<MeetRow>(
      `SELECT DISTINCT m.*
       FROM meet m
       JOIN projectUser p ON p.projectId = m.projectId
       WHERE p.userId = ?
         AND m.startedAt >= CURDATE()
         AND m.deletedAt IS NULL
       ORDER BY m.startedAt`,
      [userId],
    );

    return rows.map(toMeet);
  }

  // ✅ CHECK
  static async check(timer: { dayOfWeek: number; projectId: number }): Promise<typeof timer | null> {
    const dayOfWeekForMySQL = timer.dayOfWeek === 0 ? 1 : timer.dayOfWeek + 1;

    const rows = await db.query<MeetRow>(
      `SELECT *
       FROM meet
       WHERE projectId = ?
         AND DAYOFWEEK(startedAt) = ?
         AND startedAt >= CURDATE()
         AND deletedAt IS NULL
       LIMIT 1`,
      [timer.projectId, dayOfWeekForMySQL],
    );

    return rows.length === 0 ? timer : null;
  }

  static async updateStatus(id: number, status: MeetStatus) {
    await db.execute(
      `
        UPDATE meet
        SET status = ?
        WHERE id = ?
      `,
      [status, id],
    );
  }
}

export default MeetRepository;
