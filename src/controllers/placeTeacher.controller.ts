import { requireId } from '../utils/validation.js';
import PlaceTeacherService from '../services/placeTeacher.service.js';
import { type ControllerWithAuth, ok } from './helper.js';

type AddTeacherBody = {
  passportId: number;
};

const addTeacher: ControllerWithAuth<number, AddTeacherBody> = async (req, res) => {
  const placeId = await PlaceTeacherService.resolveAdminPlace(req.passport.id!);

  const id = await PlaceTeacherService.addTeacher(placeId, req.body.passportId);

  ok(res, id);
};

const create: ControllerWithAuth<number, AddTeacherBody> = async (req, res) => {
  const placeId = requireId(req.params.id);
  await PlaceTeacherService.requireAdmin(req.passport.id, placeId);
  const id = await PlaceTeacherService.addTeacher(placeId, req.body.passportId);

  ok(res, id);
};

const findAll: ControllerWithAuth<number> = async (req, res) => {
  const data = await PlaceTeacherService.findAll(requireId(req.viewer?.placeId));

  ok(res, data);
};

const remove: ControllerWithAuth<number> = async (req, res) => {
  const placeId = requireId(req.params.id);
  const passportId = requireId(req.params.passportId);
  await PlaceTeacherService.requireAdmin(req.passport.id, placeId);

  await PlaceTeacherService.remove(placeId, passportId);

  ok(res, true);
};


const leave: ControllerWithAuth<number> = async (req, res) => {
  const placeId = requireId(req.params.id);
  const passport = req.passport;

  await PlaceTeacherService.leave(placeId, passport.id);

  ok(res, true);
};

export default {
  addTeacher,
  create,
  findAll,
  remove,
  leave,
};
