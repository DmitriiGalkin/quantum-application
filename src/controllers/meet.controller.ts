import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import type { CreateMeet, GetMeetsQuery, MeetDto, MeetStatus, UpdateMeet } from 'entities';
import { MeetService } from '../services/meet.service.js';
import { MeetChangeResponseService } from '../services/meet-change-response.service.js';

const create: ControllerWithAuth<number, CreateMeet> = async (req, res) => {
  const meetId = await MeetService.create(req.passport!, req.body);

  ok(res, meetId);
};

const update: ControllerWithAuth<void, UpdateMeet> = async (req, res) => {
  await MeetService.update({
    ...req.body,
    id: requireId(req.params.id),
  }, req.passport.id, req.viewer?.role === 'place' ? requireId(req.viewer.placeId) : undefined);

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

const updateStatus: ControllerWithAuth<void, { status: MeetStatus; reason?: string }> = async (req, res) => {
  await MeetService.updateStatus(requireId(req.params.id), req.body.status, req.passport.id,
    req.viewer?.role === 'place' ? requireId(req.viewer.placeId) : undefined, req.body.reason);

  ok(res, '1');
};

const getPlaceMeets: ControllerWithAuth<MeetDto[]> = async (req, res) => {
  const meets = await MeetService.findAll({
    ...req.query,
    placeId: requireId(req.viewer?.placeId),
  } as GetMeetsQuery);

  ok(res, meets);
};

const cancel: ControllerWithAuth<unknown,{ reason: string; full?: boolean }> = async (req,res) => {
  await MeetService.cancelBooking(requireId(req.params.id),req.passport.id,req.body.reason,
    req.viewer?.role === 'place' ? requireId(req.viewer.placeId) : undefined,req.body.full === true);
  ok(res,true);
};
export default {
  changeResponse: (async (req,res) => {
    if (typeof req.body.accepted !== 'boolean') fail('Укажите подтверждение или отказ',400);
    await MeetChangeResponseService.respond(requireId(req.params.id),req.passport.id,requireId(req.body.userId),requireId(req.body.revision),req.body.accepted === true);
    ok(res,true);
  }) as ControllerWithAuth<unknown,{ userId:number; revision:number; accepted:boolean }>,
  getChange: (async (req,res) => {
    ok(res,await MeetChangeResponseService.get(requireId(req.params.id),req.passport.id,requireId(req.query.userId)));
  }) as ControllerWithAuth<unknown>,
  cancel,
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
