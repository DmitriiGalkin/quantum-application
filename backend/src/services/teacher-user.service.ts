import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';

export class TeacherUserService {
  static async findByTeacherId(teacherId: number) {
    const rows = await TeacherUserRepository.findByTeacherId(teacherId);

    const users = await Promise.all(rows.map(row => UserRepository.findById(row.userId)));

    return rows.map((row, i) => ({
      ...row,
      user: users[i],
    }));
  }
}
