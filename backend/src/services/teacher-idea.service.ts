import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';

export class TeacherIdeaService {
  static async findIdeasByTeacher(passportId: number) {
    const rows = await IdeaRepository.findByTeacherId(passportId);

    const users = await Promise.all(rows.map(row => UserRepository.findById(row.userId)));

    return rows.map((row, i) => ({
      ...row,
      user: users[i],
    }));
  }
}
