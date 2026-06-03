import pool from '../db.js'; // Импортируем пул соединений
import { Passport } from '../../../application/src/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { s } from '@a2a-js/sdk/dist/extensions-APfrw8gz'; // Импортируем пул соединений

class PassportModel {
  static async create(data: Passport) {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO `passport` (providerId, provider, accessToken, title, email) VALUES (?, ?, ?, ?, ?)',
        [data.providerId, data.provider, data.accessToken, data.title, data.email],
      );
      return result.insertId;
    } catch (err) {
      console.error('Passport.create error:', err);
      throw err;
    }
  }

  static async update(id: number, passportData: Passport) {
    try {
      await pool.query('UPDATE passport SET title = ? WHERE id = ?', [passportData.title, id]);
    } catch (err) {
      console.error('Passport.update error:', err);
      throw err;
    }
  }

  static async updateTokenById(token: string, id: number) {
    try {
      await pool.query('UPDATE passport SET accessToken = ? WHERE id = ?', [token, id]);
    } catch (err) {
      console.error('Passport.updateTokenById error:', err);
      throw err;
    }
  }

  static async findById(id: number) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM passport WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] as Passport : null;
  }

  /**
   * Находит пользователя по email.
   * @param {string} email - Email пользователя.
   * @returns {Promise<Passport|null>}
   */
  static async findByEmail(email: string) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM passport WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Находит пользователя по accessToken.
   * @param {string} accessToken - Токен доступа.
   * @returns {Promise<Passport|null>}
   */
  static async findByAccessToken(accessToken: string) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM passport WHERE accessToken = ?', [accessToken]);
    return rows.length > 0 ? rows[0] : null;
  }
}

export default PassportModel;
