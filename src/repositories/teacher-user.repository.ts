import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
import { toTeacherUser } from '../mappers/teacher-user.mapper.js';
import type { TeacherUser, TeacherUserRow } from 'entities';

class TeacherUserRepository {
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM teacherUser FOR UPDATE');
    return rows;
  }


  static async findByTeacherId(teacherId: number): Promise<TeacherUser[]> {
    console.log(teacherId, 'teacherId');

    const rows = await db.query<TeacherUserRow>(`SELECT * FROM teacherUser WHERE teacherId = ?`, [teacherId]);
console.log(rows);
    return rows.map(toTeacherUser);
  }

}

export default TeacherUserRepository;
