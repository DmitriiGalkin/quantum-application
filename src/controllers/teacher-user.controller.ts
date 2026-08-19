import { ControllerWithAuth, fail, ok } from './helper.js';
import { TeacherUserService } from '../services/teacher-user.service.js';
import { User } from '../entities/user.js';

const findByTeacher: ControllerWithAuth<User[]> = async (req, res) => {
  try {
    const passportId = Number(req.passport.id!);

    if (!passportId) {
      fail(res, 'passportId обязателен для findByTeacher', 400);
    }

    const rows = await TeacherUserService.findByTeacherId(passportId);

    ok(res, rows);
  } catch (err) {
    fail(res, 'Не удалось получить посещения');
  }
};

const getPlaceUsers: ControllerWithAuth<User[]> = async (req, res) => {
  try {
    const passportId = Number(req.passport.id!);

    if (!passportId) {
      fail(res, 'passportId обязателен для getPlaceUsers', 400);
    }

    const rows = await TeacherUserService.findByPlaceId(passportId, req.viewer?.placeId!);

    ok(res, rows);
  } catch (err) {
    fail(res, 'Не удалось получить учеников центра');
  }
};

export default {
  findByTeacher,
  getPlaceUsers,
};
