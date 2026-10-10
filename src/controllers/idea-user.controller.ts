import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, ok } from './helper.js';
import { IdeaUserService } from '../services/idea-user.service.js';
import type { CreateIdeaUser } from 'entities';

const create: ControllerWithAuth<void, CreateIdeaUser> = async (req, res) => {
  await IdeaUserService.create(req.passport.id!, req.body);

  ok(res, { message: 'Лайк' });
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  await IdeaUserService.remove(req.passport.id!, { ideaId: requireId(req.query.ideaId), userId: requireId(req.query.userId) });

  ok(res, { message: 'Дизлайк' });
};

export default {
  create,
  delete: remove,
};
