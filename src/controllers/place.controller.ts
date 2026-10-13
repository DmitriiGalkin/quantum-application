import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import type { CreatePlace, PlaceDashboardDto, PlaceDto, PlaceUpdateDto, PlaceProfile, PageMeta } from 'entities';
import { PlaceProfileService } from '../services/place-profile.service.js';
import { RentalService } from '../services/rental.service.js';

const findAll: Controller<PlaceDto[]> = async (_req, res) => {
  const places = await PlaceService.findAll();
  ok(res, places);
};

const create: ControllerWithAuth<number, CreatePlace> = async (req, res) => {
  const id = await PlaceService.create(req.passport.id!, req.body);
  ok(res, id);
};

const update: ControllerWithAuth<void, PlaceUpdateDto> = async (req, res) => {
  await RentalService.requireAdmin(req.passport.id, requireId(req.viewer?.placeId));
  await PlaceService.update({
    ...req.body,
    id: requireId(req.viewer?.placeId),
  });

  ok(res, { message: 'Центр обновлен' });
};

const findById: Controller<PlaceDto> = async (req, res) => {
  const place = await PlaceService.findById(requireId(req.params.id));

  if (!place) {
    fail('Место не найдено', 404);
  }

  ok(res, place);
};

const dashboard: ControllerWithAuth<PlaceDashboardDto> = async (req, res) => {
  const place = await PlaceService.getDashboard(requireId(req.viewer?.placeId));

  if (!place) {
    fail('Место не найдено', 404);
  }

  ok(res, place);
};

export default {
  profile: (async (req, res) => { ok(res, await PlaceProfileService.find(requireId(req.params.id))); }) as Controller<PlaceProfile>,
  meta: (async (req, res) => { ok(res, await PlaceProfileService.meta(requireId(req.params.id))); }) as Controller<PageMeta>,
  findAll,
  create,
  update,
  findById,
  dashboard,
};
