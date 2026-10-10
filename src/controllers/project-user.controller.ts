import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, ok } from './helper.js';
import { ProjectUserService } from '../services/project-user.service.js';
import type { CreateProjectUser } from 'entities';

const create: ControllerWithAuth<number, CreateProjectUser> = async (req, res) => {
  const result = await ProjectUserService.create(req.passport!, req.body);

  ok(res, result);
};

const leave: ControllerWithAuth<{ message: string }> = async (req, res) => {
  await ProjectUserService.leave(requireId(req.params.id), requireId(req.viewer?.userId));

  ok(res, { message: 'Выход участника из проекта осуществлен' });
};

export default {
  create,
  leave,
};
