import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import { StudentAccessService } from './student-access.service.js';
import PlaceTeacherService from './placeTeacher.service.js';

export class TeacherUserService {
  static async findByTeacherId(teacherId: number) {
    if (!teacherId) {
      throw new Error('passportId обязателен для findByTeacher');
    }

    const rows = await TeacherUserRepository.findByTeacherId(teacherId);

    const users = await Promise.all(rows.map(row => UserRepository.findById(row.userId)));

    return rows.map((row, i) => ({
      ...row,
      user: users[i],
    }));
  }

  static async findByPlaceId(passportId: number, placeId: number) {
    if (!passportId) {
      throw new Error('passportId обязателен для getPlaceUsers');
    }

    await PlaceTeacherService.requireAdmin(passportId, placeId);
    return StudentAccessService.forPlace(placeId);
  }
}
