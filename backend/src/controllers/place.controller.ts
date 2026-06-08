import { ControllerWithAuth, ok, fail } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import { IdeaDto } from '@shared/types';

const findAll = async (req, res) => {
  try {
    const places = await PlaceService.findAll();
    ok(res, places);
  } catch (err) {
    fail(res, 'Не удалось получить список мест');
  }
};

const create: ControllerWithAuth<{}> = async (req, res) => {
  try {
    const id = await PlaceService.create(req.body);
    ok(res, { message: 'Место успешно создано', id }, 201);
  } catch (err) {
    fail(res, 'Не удалось создать место');
  }
};

export default {
  findAll,
  create,
};
