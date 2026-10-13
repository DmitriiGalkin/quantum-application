import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import PlaceLocationService from '../services/placeLocation.service.js';
import type { CreateLocation, RoomDto, UpdateLocation } from 'entities';
import { RentalService } from '../services/rental.service.js';

const create: ControllerWithAuth<number, CreateLocation> = async (req, res) => {
  const placeId = requireId(req.viewer?.placeId);
  const id = await PlaceLocationService.create(placeId, req.body, req.passport.id);

  ok(res, id);
};

const findAll: ControllerWithAuth<RoomDto[]> = async (req, res) => {
  await RentalService.requireAdmin(req.passport.id, requireId(req.viewer?.placeId));
  const data = await PlaceLocationService.findAll(requireId(req.viewer?.placeId));

  ok(res, data);
};

const findByPlace: Controller<RoomDto[]> = async (req, res) => {
  const locations = await PlaceLocationService.findAll(requireId(req.params.id, 'центра'));
  ok(res, locations);
};

const remove: ControllerWithAuth<number> = async (req, res) => {
  const locationId = requireId(req.params.id);

  await PlaceLocationService.delete(locationId, requireId(req.viewer?.placeId), req.passport.id);

  ok(res, true);
};

const update: ControllerWithAuth<void, UpdateLocation> = async (req, res) => {
  await PlaceLocationService.update(requireId(req.params.id), requireId(req.viewer?.placeId), req.passport.id, req.body);
  ok(res);
};

export default {
  create,
  findAll,
  findByPlace,
  remove,
  update,
};
