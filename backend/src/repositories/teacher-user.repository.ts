import { db } from '../dbNext.js';
import { toTeacherUser } from '../mappers/teacher-user.mapper.js';
import { TeacherUser } from '../entities/teacher-user.js';
import { TeacherUserRow } from '../entities/teacher-user.db.js';

class TeacherUserRepository {

  static async findByTeacherId(teacherId: number): Promise<TeacherUser[]> {
    console.log(teacherId, 'teacherId');

    const rows = await db.query<TeacherUserRow>(`SELECT * FROM teacherUser WHERE teacherId = ?`, [teacherId]);
console.log(rows);
    return rows.map(toTeacherUser);
  }

}

export default TeacherUserRepository;
