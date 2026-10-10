import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import type { CreatePlace, PlaceDashboardDto, PlaceDto, PlaceUpdateDto } from 'entities';

const findAll: Controller<PlaceDto[]> = async (_req, res) => {
  const places = await PlaceService.findAll();
  ok(res, places);
};

const create: ControllerWithAuth<number, CreatePlace> = async (req, res) => {
  const id = await PlaceService.create(req.passport.id!, req.body);
  ok(res, id);
};

const update: ControllerWithAuth<void, PlaceUpdateDto> = async (req, res) => {
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
  findAll,
  create,
  update,
  findById,
  dashboard,
};
