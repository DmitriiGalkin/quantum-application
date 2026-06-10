import { ControllerWithAuth, ok, fail } from './helper.js';
import { IdeaUserService } from '../services/idea-user.service.js';

const create: ControllerWithAuth<{}> = async (req, res) => {
  try {
    await IdeaUserService.create(req.passport.id!, req.query);

    ok(res, { message: 'Лайк' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать участие');
  }
};

const remove: ControllerWithAuth<{}> = async (req, res) => {
  try {
    await IdeaUserService.remove(req.passport.id!, req.query);

    ok(res, { message: 'Дизлайк' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось удалить участие');
  }
};

export default {
  create,
  delete: remove,
};
