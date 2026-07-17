import { ControllerWithAuth, fail, ok } from './helper.js';
import { ProjectUserService } from '../services/project-user.service.js';
import type { CreateProjectUser } from '@shared/types';

const create: ControllerWithAuth<number, CreateProjectUser> = async (req, res) => {
  try {
    const result = await ProjectUserService.create(req.passport!, req.body);

    ok(res, result);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участие в проекте');
  }
};

const leave: ControllerWithAuth<{}> = async (req, res) => {
  try {
    await ProjectUserService.leave(Number(req.params.id), req.viewer?.userId!);

    ok(res, { message: 'Выход участника из проекта осуществлен' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось удалить участие в проекте');
  }
};;

export default {
  create,
  leave,
};