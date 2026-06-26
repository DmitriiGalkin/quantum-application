import PlacePassportRepository from '../repositories/place-passport.repository.js';

class PlaceTeacherService {
  static async addTeacher(placeId: number, teacherPassportId: number) {
    // TODO: проверить что passportId = admin place
    return PlacePassportRepository.create({
      placeId,
      passportId: teacherPassportId,
      role: 'teacher',
    });
  }

  static async findAll(placeId: number) {
    // TODO: проверить доступ к place
    return PlacePassportRepository.findTeachers(placeId);
  }

  static async remove(placeId: number, teacherPassportId: number) {
    // TODO: проверить доступ
    return PlacePassportRepository.removeTeacher(placeId, teacherPassportId);
  }

  static async resolveAdminPlace(passportId: number) {
    const placeId = await PlacePassportRepository.findAdminPlace(passportId);

    if (!placeId) {
      throw new Error('PLACE_NOT_FOUND');
    }

    return placeId;
  }
}

export default PlaceTeacherService;
