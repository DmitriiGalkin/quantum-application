import { type ControllerWithAuth, fail, ok } from './helper.js';
import { TeacherUserService } from '../services/teacher-user.service.js';
import type { User } from 'entities/user.js';

const findByTeacher: ControllerWithAuth<User[]> = async (req, res) => {
  try {
    const rows = await TeacherUserService.findByTeacherId(Number(req.passport.id!));

    ok(res, rows);
  } catch (err) {
    fail(res, 'Не удалось получить посещения');
  }
};

const getPlaceUsers: ControllerWithAuth<User[]> = async (req, res) => {
  try {
    const rows = await TeacherUserService.findByPlaceId(Number(req.passport.id!), req.viewer?.placeId!);

    ok(res, rows);
  } catch (err) {
    fail(res, 'Не удалось получить учеников центра');
  }
};

export default {
  findByTeacher,
  getPlaceUsers,
};
