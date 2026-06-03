import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'; // Импортируем пул соединений
import { Visit } from '../../../application/src/types'; // Импортируем пул соединений

class VisitModel {
  static async create(visitData: Visit) {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO visit (userId, meetId) VALUES (?, ?)', [visitData.userId, visitData.meetId]);
      return result.insertId;
    } catch (err) {
      console.error('Visit.create error:', err);
      throw err;
    }
  }

  static async delete(id: string) {
    try {
      // ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ: Используем плейсхолдер, а не интерполяцию!
      await pool.query('DELETE FROM visit WHERE id = ?', [id]);
    } catch (err) {
      console.error('Visit.delete error:', err);
      throw err;
    }
  }

  static async findById(id: string) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM visit WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Visit.findById error:', err);
      throw err;
    }
  }

  static async findByUserId(userId: string) {
    try {
      const sql = `
        SELECT visit.*, meet.startedAt 
        FROM visit 
        LEFT JOIN meet ON meet.id = visit.meetId 
        WHERE userId = ? 
        ORDER BY meet.startedAt DESC
      `;
      const [rows] = await pool.query(sql, [userId]);
      return rows;
    } catch (err) {
      console.error('Visit.findByUserId error:', err);
      throw err;
    }
  }

  static async findByUserAndMeetIds(userId: string, meetId: string) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM visit WHERE userId = ? AND meetId = ?', [userId, meetId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Visit.findByUserAndMeetIds error:', err);
      throw err;
    }
  }

  static async findByMeet(meetId: string) {
    try {
      const [rows] = await pool.query('SELECT * FROM visit WHERE meetId = ?', [meetId]);
      return rows;
    } catch (err) {
      console.error('Visit.findByMeet error:', err);
      throw err;
    }
  }
}

export default VisitModel;
