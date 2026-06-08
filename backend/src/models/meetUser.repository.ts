import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

export interface MeetUserRow extends RowDataPacket {
  id: number;
  userId: number;
  meetId: number;
}

export interface MeetUserWithMeetRow extends MeetUserRow {
  startedAt: string | null;
}

export interface MeetUserFullRow extends RowDataPacket {
  id: number;
  userId: number;
  meetId: number;

  meetIdJoin: number | null;
  meetStartedAt: string | null;
  meetProjectId: number | null;

  projectIdJoin: number | null;
  projectTitle: string | null;
  projectPlaceId: number | null;

  placeIdJoin: number | null;
  placeTitle: string | null;
  latitude: number | null;
  longitude: number | null;
}

class MeetUserRepository {
  // ✅ CREATE
  static async create(data: { userId: number; meetId: number }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO meetUser (userId, meetId) VALUES (?, ?)', [data.userId, data.meetId]);

    return result.insertId;
  }

  // ✅ DELETE
  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM meetUser WHERE id = ?', [id]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<MeetUserRow | null> {
    const [rows] = await pool.query<MeetUserRow[]>('SELECT * FROM meetUser WHERE id = ?', [id]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY USER ID (с JOIN)
  static async findByUserId(userId: number): Promise<MeetUserWithMeetRow[]> {
    const [rows] = await pool.query<MeetUserWithMeetRow[]>(
      `SELECT meetUser.*, meet.startedAt
       FROM meetUser
       LEFT JOIN meet ON meet.id = meetUser.meetId
       WHERE userId = ?
       ORDER BY meet.startedAt DESC`,
      [userId],
    );

    return rows;
  }

  // ✅ FIND BY USER + MEET
  static async findByUserAndMeetIds(userId: number, meetId: number): Promise<MeetUserRow | null> {
    const [rows] = await pool.query<MeetUserRow[]>('SELECT * FROM meetUser WHERE userId = ? AND meetId = ?', [userId, meetId]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY MEET
  static async findByMeet(meetId: number): Promise<MeetUserRow[]> {
    const [rows] = await pool.query<MeetUserRow[]>('SELECT * FROM meetUser WHERE meetId = ?', [meetId]);

    return rows;
  }

  // 🔥 СЛОЖНЫЙ JOIN (без any, без as)
  static async findAll(userId: number) {
    const [rows] = await pool.query<MeetUserFullRow[]>(
      `SELECT v.*,
              m.id        AS meetIdJoin,
              m.startedAt AS meetStartedAt,
              m.projectId AS meetProjectId,
              p.id        AS projectIdJoin,
              p.title     AS projectTitle,
              p.placeId   AS projectPlaceId,
              pl.id       AS placeIdJoin,
              pl.title    AS placeTitle,
              pl.latitude AS latitude,
              pl.longitude AS longitude
       FROM meetUser v
              LEFT JOIN meet m ON m.id = v.meetId AND m.deletedAt IS NULL
              LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
              LEFT JOIN place pl ON pl.id = p.placeId
       WHERE v.userId = ?
       ORDER BY m.startedAt DESC`,
      [userId],
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      meetId: row.meetId,

      meet: row.meetIdJoin
        ? {
            id: row.meetIdJoin,
            startedAt: row.meetStartedAt,
            project: row.projectIdJoin
              ? {
                  id: row.projectIdJoin,
                  title: row.projectTitle,
                  place: row.placeIdJoin
                    ? {
                        id: row.placeIdJoin,
                        title: row.placeTitle,
                        latitude: row.latitude,
                        longitude: row.longitude,
                      }
                    : null,
                }
              : null,
          }
        : null,
    }));
  }
}

export default MeetUserRepository;