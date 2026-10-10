import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, ok } from './helper.js';
import PlaceLocationService from '../services/placeLocation.service.js';
import type { CreateLocation, LocationDto } from 'entities';

const create: ControllerWithAuth<number, CreateLocation> = async (req, res) => {
  const placeId = requireId(req.viewer?.placeId);
  const id = await PlaceLocationService.create(placeId, req.body);

  ok(res, id);
};

const findAll: ControllerWithAuth<LocationDto> = async (req, res) => {
  const data = await PlaceLocationService.findAll(requireId(req.viewer?.placeId));

  ok(res, data);
};

const remove: ControllerWithAuth<number> = async (req, res) => {
  const locationId = requireId(req.params.id);

  await PlaceLocationService.delete(locationId);

  ok(res, true);
};

export default {
  create,
  findAll,
  remove,
};
