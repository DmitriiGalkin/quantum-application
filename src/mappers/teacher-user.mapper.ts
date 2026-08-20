import type { TeacherUserRow } from '../entities/teacher-user.db.js';
import type { TeacherUser } from '../entities/teacher-user.js';

export function toTeacherUser(row: TeacherUserRow): TeacherUser {
  return {
    id: row.id,
    teacherId: row.teacherId,
    userId: row.userId,
  };
}
