import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import type { CreateMeet, GetMeetsQuery, MeetDto, MeetStatus, UpdateMeet } from 'entities';
import { MeetService } from '../services/meet.service.js';

const create: ControllerWithAuth<number, CreateMeet> = async (req, res) => {
  const meetId = await MeetService.create(req.passport!, req.body);

  ok(res, meetId);
};

const update: ControllerWithAuth<void, UpdateMeet> = async (req, res) => {
  await MeetService.update({
    ...req.body,
    id: requireId(req.params.id),
  }, req.passport.id);

  ok(res, { message: 'Встреча обновлена' });
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  await MeetService.remove(requireId(req.params.id), req.passport!.id);

  ok(res, { message: 'Встреча удалена' });
};


const findAll: Controller<MeetDto[]> = async (req, res) => {
  const meets = await MeetService.findAll({
    ...req.query,
  } as GetMeetsQuery);

  ok(res, meets);
};

const findByUserId: ControllerWithAuth<MeetDto[]> = async (req, res) => {
  const meets = await MeetService.findAll({ userId: requireId(req.viewer?.userId) });

  ok(res, meets);
};

const findPassportAll: ControllerWithAuth<MeetDto[]> = async (req, res) => {
  const meets = await MeetService.findAll({
    ...req.query,
    passportId: req.passport!.id,
  });

  ok(res, meets);
};

const findById: Controller<MeetDto> = async (req, res) => {
  const meet = await MeetService.findById(requireId(req.params.id));

  if (!meet) {
    fail('Встреча не найдена', 404);
  }

  ok(res, meet);
};

const updateStatus: ControllerWithAuth<void, { status: MeetStatus }> = async (req, res) => {
  await MeetService.updateStatus(requireId(req.params.id), req.body.status, req.passport.id);

  ok(res, '1');
};

const getPlaceMeets: ControllerWithAuth<MeetDto[]> = async (req, res) => {
  const meets = await MeetService.findAll({
    ...req.query,
    placeId: requireId(req.viewer?.placeId),
  } as GetMeetsQuery);

  ok(res, meets);
};

export default {
  create,
  update,
  delete: remove,
  findAll,
  findPassportAll,
  findById,
  updateStatus,
  getPlaceMeets,
  findByUserId,
};
