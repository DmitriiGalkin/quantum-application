import { ControllerWithAuth, fail, ok } from './helper.js';
import { ProjectUserService } from '../services/project-user.service.js';

const create: ControllerWithAuth<number> = async (req, res) => {
  try {
    const result = await ProjectUserService.create(req.passport!, req.body);

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать участие в проекте');
  }
};

const remove: ControllerWithAuth<{}> = async (req, res) => {
  try {
    await ProjectUserService.remove(req.passport!, Number(req.params.id));

    ok(res, { message: 'Удаление участия в проекте прошло успешно' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось удалить участие в проекте');
  }
};

export default {
  create,
  delete: remove,
};