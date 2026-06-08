import { ControllerWithAuth, ok, fail } from './helper.js';
import { MeetUserService } from '../services/meetUser.service.js';

const create: ControllerWithAuth = async (req, res) => {
  try {
    await MeetUserService.create(req.passport!, req.body);

    ok(res, { message: 'Участие создано' }, 201);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать участие');
  }
};

const remove: ControllerWithAuth = async (req, res) => {
  try {
    await MeetUserService.remove(req.passport!, Number(req.params.id));

    ok(res, { message: 'Участник удален из встречи' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось удалить участие');
  }
};

const findAll: ControllerWithAuth = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return fail(res, 'userId обязателен', 400);
    }

    const rows = await MeetUserService.findAll(userId);

    ok(res, rows);
  } catch (err) {
    fail(res, 'Не удалось получить посещения');
  }
};

export default {
  create,
  delete: remove,
  findAll,
};
