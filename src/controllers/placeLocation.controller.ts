import { ControllerWithAuth, fail, ok } from './helper.js';
import PlaceLocationService from '../services/placeLocation.service.js';
import { CreateLocation, LocationDto } from 'types';

const create: ControllerWithAuth<number, CreateLocation> = async (req, res) => {
  try {
    const placeId = Number(req.viewer?.placeId);
    const id = await PlaceLocationService.create(placeId, req.body);

    ok(res, id);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось добавить учителя');
  }
};

const findAll: ControllerWithAuth<LocationDto> = async (req, res) => {
  try {
    const data = await PlaceLocationService.findAll(Number(req.viewer?.placeId!));

    ok(res, data);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось получить кабинеты центра');
  }
};

const remove: ControllerWithAuth<number> = async (req, res) => {
  try {
    const locationId = Number(req.params.id!);

    await PlaceLocationService.delete(locationId);

    ok(res, true);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось удалить учителя');
  }
};

export default {
  create,
  findAll,
  remove,
};
