import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { User } from '@shared/types';

interface UserRow extends RowDataPacket {
  id: number;
  passportId: number;
  title: string;
}

class UserRepository {
  static async create(data: User) {
    try {
      // В запросе используются только поля, которые есть в модели
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO `user` (title, passportId, description, age) VALUES (?, ?, ?, ?)', [
        data.title,
        data.passportId,
        data.description,
        data.age,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('User.create error:', err);
      throw err;
    }
  }

  static async update(userData: User) {
    try {
      await pool.query('UPDATE user SET title=?, age=?, image=? WHERE id = ?', [userData.title, userData.age, userData.image, userData.id]);
    } catch (err) {
      console.error('User.update error:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      await pool.query('UPDATE user SET deletedAt = NOW() WHERE id = ?', [id]);
    } catch (err) {
      console.error('User.delete error:', err);
      throw err;
    }
  }

  static async findById(id: number): Promise<UserRow | null> {
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT * FROM `user` WHERE id = ?', [id]);
      return rows[0] ?? null;
    } catch (err) {
      console.error('User.findById error:', err);
      throw err;
    }
  }

  static async findByPassportId(passportId: number) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM user WHERE passportId = ? AND deletedAt IS NULL', [passportId]);
      return rows as User[];
    } catch (err) {
      console.error('User.findByPassportId error:', err);
      throw err;
    }
  }

  static async findByProjectId(projectId: number) {
    try {
      const sql = `
        SELECT DISTINCT user.*
        FROM user
        LEFT JOIN projectUser ON user.id = projectUser.userId
        WHERE projectUser.projectId = ?
      `;
      const [rows] = await pool.query<RowDataPacket[]>(sql, [projectId]);
      return rows as User[];
    } catch (err) {
      console.error('User.findByProjectId error:', err);
      throw err;
    }
  }

  static async findByMeetId(meetId: number) {
    try {
      const sql = `
        SELECT DISTINCT user.*, meetUser.id as meetUserId
        FROM user
        LEFT JOIN meetUser ON user.id = meetUser.userId
        WHERE meetUser.meetId = ?
          AND user.deletedAt IS NULL
      `;
      const [rows] = await pool.query<RowDataPacket[]>(sql, [meetId]);
      return rows as User[];
    } catch (err) {
      console.error('User.findByMeet error:', err);
      throw err;
    }
  }
}

export default UserRepository;