import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, ok } from './helper.js';
import { MeetUserService } from '../services/meet-user.service.js';
import type { CreateMeetUser, MeetUserFull } from 'entities';

const create: ControllerWithAuth<void, CreateMeetUser> = async (req, res) => {
  await MeetUserService.create(req.passport.id!, req.body);

  ok(res, { message: 'Участие создано' });
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  await MeetUserService.remove(req.passport.id!, { meetId: requireId(req.query.meetId), userId: requireId(req.query.userId) });

  ok(res, { message: 'Участник удален из встречи' });
};

const findAll: ControllerWithAuth<MeetUserFull[]> = async (req, res) => {
  const rows = await MeetUserService.findAll(Number(req.query.userId));

  ok(res, rows);
};

export default {
  create,
  delete: remove,
  findAll,
};
