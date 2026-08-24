import type { TeacherUserRow, TeacherUser } from 'entities';

export function toTeacherUser(row: TeacherUserRow): TeacherUser {
  return {
    id: row.id,
    teacherId: row.teacherId,
    userId: row.userId,
  };
}
