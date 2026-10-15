import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, ok } from './helper.js';
import { TeacherUserService } from '../services/teacher-user.service.js';
import type { User, UserDto } from 'entities';

const findByTeacher: ControllerWithAuth<User[]> = async (req, res) => {
  const rows = await TeacherUserService.findByTeacherId(Number(req.passport.id!));

  ok(res, rows);
};

const getPlaceUsers: ControllerWithAuth<UserDto[]> = async (req, res) => {
  const rows = await TeacherUserService.findByPlaceId(Number(req.passport.id!), requireId(req.viewer?.placeId));

  ok(res, rows);
};

export default {
  findByTeacher,
  getPlaceUsers,
};
