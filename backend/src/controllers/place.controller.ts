import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import { PlaceDto } from '@shared/types';

const findAll: Controller<PlaceDto[]> = async (req, res) => {
  try {
    const places = await PlaceService.findAll();
    ok(res, places);
  } catch (err) {
    fail(res, 'Не удалось получить список мест');
  }
};

const create: ControllerWithAuth<number> = async (req, res) => {
  try {
    const id = await PlaceService.create(req.body);
    ok(res, id);
  } catch (err) {
    fail(res, 'Не удалось создать место');
  }
};

export default {
  findAll,
  create,
};
