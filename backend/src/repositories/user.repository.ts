import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';
import { UserRow, UserWithMeetRow } from '../entities/user.db.js';
import { mapUserRow, mapUserWithMeetRow } from '../mappers/user.mapper.js';
import { User, UserWithMeet } from '../entities/user.js';
import { CreateUserInput, UpdateUserInput } from '../entities/user.types.js';

class UserRepository {
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
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    const result = await db.execute<ResultSetHeader>(`UPDATE user SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE user SET deletedAt = NOW() WHERE id = ?`, [id]);
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
      `SELECT DISTINCT user.*
       FROM user
       LEFT JOIN projectUser ON user.id = projectUser.userId
       WHERE projectUser.projectId = ?`,
      [projectId],
    );

    return rows.map(mapUserRow);
  }

  // ✅ FIND BY MEET
  static async findByMeetId(meetId: number): Promise<UserWithMeet[]> {
    console.log(meetId, 'meetId');
    const rows = await db.query<UserWithMeetRow>(
      `SELECT DISTINCT user.*, meetUser.id as meetUserId
       FROM user
       LEFT JOIN meetUser ON user.id = meetUser.userId
       WHERE meetUser.meetId = ?
         AND user.deletedAt IS NULL`,
      [meetId],
    );

    console.log(rows, 'rows');

    return rows.map(mapUserWithMeetRow);
  }
}

export default UserRepository;
