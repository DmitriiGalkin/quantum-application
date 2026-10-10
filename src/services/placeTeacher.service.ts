import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { HttpError } from '../utils/http-error.js';

class PlaceTeacherService {
  static async requireAdmin(passportId: number, placeId: number): Promise<void> {
    const membership = await PlacePassportRepository.findMembership(passportId, placeId);
    if (membership?.role !== 'admin') throw new HttpError('Нет доступа к управлению центром', 403);
  }
  static async addTeacher(placeId: number, teacherPassportId: number) {
    const exists = await PlacePassportRepository.exists(teacherPassportId, placeId);


    if (exists) {
      return exists as number;
    }

    return PlacePassportRepository.create({
      placeId,
      passportId: teacherPassportId,
      role: 'teacher',
    });
  }

  static async findAll(placeId: number) {
    return PlacePassportRepository.findTeachers(placeId);
  }

  static async remove(placeId: number, teacherPassportId: number) {
    return PlacePassportRepository.removeTeacher(placeId, teacherPassportId);
  }

  static async leave(placeId: number, passportId: number) {
    return PlacePassportRepository.removeTeacher(placeId, passportId);
  }

  static async resolveAdminPlace(passportId: number) {
    const placeId = await PlacePassportRepository.findAdminPlace(passportId);

    if (!placeId) {
      throw new HttpError('PLACE_NOT_FOUND', 404);
    }

    return placeId;
  }
}

export default PlaceTeacherService;
