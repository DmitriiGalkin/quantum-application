import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import { CreatePlace, type MeetExtendedDto, PlaceDto } from '@shared/types';
import { MeetService } from '../services/meet.service.js';

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

const findById: Controller<MeetExtendedDto> = async (req, res) => {
  try {
    console.log('findById!!');

    const meet = await PlaceService.findById(Number(req.params.id));

    if (!meet) {
      fail(res, 'Место не найдено', 404);
    }

    ok(res, meet);
  } catch (err) {
    fail(res, 'Ошибка при получении места');
  }
};

export default {
  findAll,
  create,
  findById,
};
