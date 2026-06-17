import { ResultSetHeader } from 'mysql2/promise';

import { MeetUserFullRow, MeetUserRow, MeetUserWithMeetRow } from '../entities/meet-user.db.js';

import { mapMeetUserFullRow, mapMeetUserRow, mapMeetUserWithMeetRow } from '../mappers/meet-user.mapper.js';

import { MeetUser, MeetUserWithMeet } from '../entities/meet-user.js';

import { MeetUserFull } from '../entities/meet-user.view.js';
import { db } from '../dbNext.js';
import { DeleteMeetUser } from '@shared/types';

class MeetUserRepository {
  // ✅ CREATE
  static async create(data: { userId: number; meetId: number }): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO meetUser (userId, meetId)
       VALUES (?, ?)`,
      [data.userId, data.meetId],
    );

    return result.insertId;
  }

  // ✅ DELETE
  static async delete({meetId, userId}: DeleteMeetUser): Promise<boolean> {
    const result = await db.execute<ResultSetHeader>(`DELETE FROM meetUser WHERE meetId = ? AND userId = ?`, [meetId, userId]);

    return result.affectedRows > 0;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<MeetUser | null> {
    const rows = await db.query<MeetUserRow>(`SELECT * FROM meetUser WHERE id = ?`, [id]);

    return rows[0] ? mapMeetUserRow(rows[0]) : null;
  }

  // ✅ FIND BY USER
  static async findByUserId(userId: number): Promise<MeetUserWithMeet[]> {
    const rows = await db.query<MeetUserWithMeetRow>(
      `SELECT meetUser.*, meet.startedAt
       FROM meetUser
              LEFT JOIN meet ON meet.id = meetUser.meetId
       WHERE userId = ?
       ORDER BY meet.startedAt DESC`,
      [userId],
    );

    return rows.map(mapMeetUserWithMeetRow);
  }

  // ✅ FIND BY USER + MEET
  static async findByUserAndMeetIds(userId: number, meetId: number): Promise<MeetUser | null> {
    const rows = await db.query<MeetUserRow>(`SELECT * FROM meetUser WHERE userId = ? AND meetId = ?`, [userId, meetId]);
    return rows[0] ? mapMeetUserRow(rows[0]) : null;
  }

  // ✅ FIND BY MEET
  static async findByMeet(meetId: number): Promise<MeetUser[]> {
    const rows = await db.query<MeetUserRow>(`SELECT * FROM meetUser WHERE meetId = ?`, [meetId]);

    return rows.map(mapMeetUserRow);
  }

  // 🔥 COMPLEX VIEW
  static async findAll(userId: number): Promise<MeetUserFull[]> {
    const rows = await db.query<MeetUserFullRow>(
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

    return rows.map(mapMeetUserFullRow);
  }
}

export default MeetUserRepository;
