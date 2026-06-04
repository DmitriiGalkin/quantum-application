import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'; // Импортируем пул соединений
import { MeetUser } from '../../../application/src/types'; // Импортируем пул соединений

class MeetUserModel {
  static async create(data: MeetUser) {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO meetUser (userId, meetId) VALUES (?, ?)', [data.userId, data.meetId]);
      return result.insertId;
    } catch (err) {
      console.error('meetUser.create error:', err);
      throw err;
    }
  }

  static async delete(id: string) {
    try {
      // ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ: Используем плейсхолдер, а не интерполяцию!
      await pool.query('DELETE FROM meetUser WHERE id = ?', [id]);
    } catch (err) {
      console.error('meetUser.delete error:', err);
      throw err;
    }
  }

  static async findById(id: string) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM meetUser WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('meetUser.findById error:', err);
      throw err;
    }
  }

  static async findByUserId(userId: string) {
    try {
      const sql = `
        SELECT meetUser.*, meet.startedAt 
        FROM meetUser 
        LEFT JOIN meet ON meet.id = meetUser.meetId 
        WHERE userId = ? 
        ORDER BY meet.startedAt DESC
      `;
      const [rows] = await pool.query(sql, [userId]);
      return rows;
    } catch (err) {
      console.error('meetUser.findByUserId error:', err);
      throw err;
    }
  }

  static async findByUserAndMeetIds(userId: string, meetId: string) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM meetUser WHERE userId = ? AND meetId = ?', [userId, meetId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('meetUser.findByUserAndMeetIds error:', err);
      throw err;
    }
  }

  static async findByMeet(meetId: number) {
    try {
      const [rows] = await pool.query('SELECT * FROM meetUser WHERE meetId = ?', [meetId]);
      return rows as MeetUser[];
    } catch (err) {
      console.error('MeetUser.findByMeet error:', err);
      throw err;
    }
  }

  /**
   * Получение всех встреч для конкретного пользователя
   * Оптимизированный запрос с JOIN для сборки вложенной структуры данных.
   */
  static async findAll(userId: string) {
    try {
      const sql = `
        SELECT v.*,
               m.id        AS meet_id,
               m.startedAt AS meet_startedAt,
               m.projectId AS meet_projectId,
               p.id        AS project_id,
               p.title     AS project_title,
               p.placeId   AS project_placeId,
               pl.id       AS place_id,
               pl.title    AS place_title,
               pl.latitude,
               pl.longitude
        FROM meetUser v
               LEFT JOIN meet m ON m.id = v.meetId AND m.deletedAt IS NULL
               LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
               LEFT JOIN place pl ON pl.id = p.placeId
        WHERE v.userId = ?
        ORDER BY m.startedAt DESC
      `;

      const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);

      // Группируем данные. Ключевое изменение: используем meet_id для проверки наличия встречи.
      const result = rows.map(row => ({
        ...row,
        meet: row.meet_id
          ? {
              id: row.meet_id,
              startedAt: row.meet_startedAt,
              project: row.project_id
                ? {
                    id: row.project_id,
                    title: row.project_title,
                    place: row.place_id
                      ? {
                          id: row.place_id,
                          title: row.place_title,
                          latitude: row.latitude,
                          longitude: row.longitude,
                        }
                      : null,
                  }
                : null,
            }
          : null,
      }));

      return result;
    } catch (err) {
      console.error('meetUser. error:', err);
      throw err;
    }
  }
}

export default MeetUserModel;
