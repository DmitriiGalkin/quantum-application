import { db } from '../utils/dbNext.js';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type { UserRow, UserWithMeetRow, User, UserWithMeet, CreateUserInput, UpdateUserInput } from 'entities';
import { mapUserRow, mapUserWithMeetRow } from '../mappers/user.mapper.js';

class UserRepository {
  static async findByIds(ids: number[], activeOnly = false): Promise<User[]> {
    if (!ids.length) return [];
    const rows = await db.query<UserRow>(
      'SELECT * FROM user WHERE id IN (?)' + (activeOnly ? ' AND deletedAt IS NULL' : ''),
      [[...new Set(ids)]],
    );
    return rows.map(mapUserRow);
  }

  // ✅ CREATE
  static async create(data: CreateUserInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO user (passportId, title, description, age)
       VALUES (?, ?, ?, ?)`,
      [data.passportId, data.title, data.description ?? null, data.age ?? null],
    );

    return result.insertId;
  }

  // ✅ UPDATE (partial)
  static async update(id: number, data: UpdateUserInput): Promise<boolean> {
    const keys = ['title', 'age', 'image'] as const;
    const entries = keys.filter(key => data[key] !== undefined).map(key => [key, data[key]] as const);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    const result = await db.execute<ResultSetHeader>(`UPDATE user SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE
  static async delete(id: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? db).execute(`UPDATE user SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<User | null> {
    const rows = await db.query<UserRow>(`SELECT * FROM user WHERE id = ?`, [id]);

    return rows[0] ? mapUserRow(rows[0]) : null;
  }

  // ✅ FIND BY PASSPORT
  static async findByPassportId(passportId: number): Promise<User[]> {
    const rows = await db.query<UserRow>(
      `SELECT *
       FROM user
       WHERE passportId = ?
         AND deletedAt IS NULL`,
      [passportId],
    );

    return rows.map(mapUserRow);
  }

  // ✅ FIND BY PROJECT
  static async findByProjectId(projectId: number): Promise<User[]> {
    const rows = await db.query<UserRow>(
      `SELECT user.*
       FROM user
              LEFT JOIN projectUser ON user.id = projectUser.userId
       WHERE projectUser.projectId = ?
       ORDER BY projectUser.createdAt DESC`,
      [projectId],
    );

    return rows.map(mapUserRow);
  }

  // ✅ FIND BY MEET
  static async findByMeetId(meetId: number): Promise<UserWithMeet[]> {
    const rows = await db.query<UserWithMeetRow>(
      `SELECT DISTINCT user.*, meetUser.id as meetUserId
       FROM user
       LEFT JOIN meetUser ON user.id = meetUser.userId
       WHERE meetUser.meetId = ?
         AND user.deletedAt IS NULL`,
      [meetId],
    );

    return rows.map(mapUserWithMeetRow);
  }
}

export default UserRepository;
