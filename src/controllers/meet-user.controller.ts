import { type ControllerWithAuth, fail, ok } from './helper.js';
import { MeetUserService } from '../services/meet-user.service.js';
import type { MeetUserFull } from 'entities/meet-user.view.js';
import type { CreateMeetUser, DeleteMeetUser } from 'entities';

const create: ControllerWithAuth<void, CreateMeetUser> = async (req, res) => {
  try {
    await MeetUserService.create(req.passport.id!, req.body);

    ok(res, { message: 'Участие создано' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участие');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    await MeetUserService.remove(req.passport.id!, req.query as unknown as DeleteMeetUser);

    ok(res, { message: 'Участник удален из встречи' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось удалить участие');
  }
};

const findAll: ControllerWithAuth<MeetUserFull[]> = async (req, res) => {
  try {
    const rows = await MeetUserService.findAll(Number(req.query.userId));

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
