import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';

export class TeacherUserService {
  static async findByTeacherId(teacherId: number) {
    const rows = await TeacherUserRepository.findByTeacherId(teacherId);

    const users = await Promise.all(rows.map(row => UserRepository.findById(row.userId)));

    return rows.map((row, i) => ({
      ...row,
      user: users[i],
    }));
  }

  static async findByPlaceId(passportId: number, placeId: number) {
    const teachers = await PlacePassportRepository.findTeachers(placeId);

    const rows = await Promise.all(teachers.map(row => TeacherUserRepository.findByTeacherId(row.id)));

    const users = await Promise.all(rows.flat().map(row => UserRepository.findById(row.userId)));

    return users;
  }
}
