import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import { CreatePlace, PlaceDto } from '@shared/types';

const findAll: Controller<PlaceDto[]> = async (_req, res) => {
  try {
    const places = await PlaceService.findAll();
    ok(res, places);
  } catch (err) {
    fail(res, 'Не удалось получить список мест');
  }
};

const create: ControllerWithAuth<number, CreatePlace> = async (req, res) => {
  try {
    const id = await PlaceService.create(req.passport.id!, req.body);
    ok(res, id);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось создать место');
  }
};

export default {
  findAll,
  create,
};
