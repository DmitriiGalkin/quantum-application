import { ResultSetHeader } from 'mysql2/promise';
import { MeetRow, MeetWithProjectTitleRow } from '../entities/meet.db.js';
import { toMeet, mapMeetWithProjectTitle } from '../mappers/meet.mapper.js';
import { Meet, MeetWithProjectTitle } from '../entities/meet.js';
import { CreateMeetInput, UpdateMeetInput } from '../entities/meet.types.js';
import { db } from '../dbNext.js';

class MeetRepository {
  // ✅ CREATE
  static async create(data: CreateMeetInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO meet (passportId, projectId, price, duration, startedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [data.passportId, data.projectId, data.price, data.duration, data.startedAt],
    );

    return result.insertId;
  }

  // ✅ UPDATE (нормальный partial)
  static async update(id: number, data: UpdateMeetInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    const result = await db.execute<ResultSetHeader>(`UPDATE meet SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE meet SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  static async deleteByProjectId(projectId: number): Promise<void> {
    await db.execute(`UPDATE meet SET deletedAt = NOW() WHERE projectId = ?`, [projectId]);
  }

  // ✅ FIND ALL
  static async findAll(): Promise<Meet[]> {
    const rows = await db.query<MeetRow>(
      `SELECT *
       FROM meet
       WHERE startedAt >= CURDATE()
         AND deletedAt IS NULL
       ORDER BY startedAt`,
    );

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
  static async findByProjectId(projectId: number): Promise<Meet[]> {
    const rows = await db.query<MeetRow>(
      `SELECT *
       FROM meet
       WHERE projectId = ?
         AND deletedAt IS NULL
       ORDER BY startedAt`,
      [projectId],
    );
    ////AND startedAt >= CURDATE()
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
}

export default MeetRepository;
