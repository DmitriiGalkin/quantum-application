import { ControllerWithAuth, fail, ok } from './helper.js';
import { ProjectUserService } from '../services/project-user.service.js';
import type { CreateProjectUser, DeleteProjectUser } from '@shared/types';

const create: ControllerWithAuth<number, CreateProjectUser> = async (req, res) => {
  try {
    const result = await ProjectUserService.create(req.passport!, req.body);

    ok(res, result);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участие в проекте');
  }
};

const remove: ControllerWithAuth<{}> = async (req, res) => {
  try {
    await ProjectUserService.remove(req.passport.id!, req.query as unknown as DeleteProjectUser);

    ok(res, { message: 'Удаление участия в проекте прошло успешно' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось удалить участие в проекте');
  }
};

export default {
  create,
  delete: remove,
};