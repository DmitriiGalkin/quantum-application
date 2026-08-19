import { ControllerWithAuth, fail, ok } from './helper.js';
import { IdeaUserService } from '../services/idea-user.service.js';
import { CreateIdeaUser, DeleteIdeaUser } from 'dto';

const create: ControllerWithAuth<void, CreateIdeaUser> = async (req, res) => {
  try {
    await IdeaUserService.create(req.passport.id!, req.body);

    ok(res, { message: 'Лайк' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участие');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    await IdeaUserService.remove(req.passport.id!, req.query as unknown as DeleteIdeaUser);

    ok(res, { message: 'Дизлайк' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось удалить участие');
  }
};

export default {
  create,
  delete: remove,
};
