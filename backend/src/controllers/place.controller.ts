import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { PlaceService } from '../services/place.service.js';
import { CreatePlace, type MeetExtendedDto, PlaceDashboardDto, PlaceDto, PlaceUpdateDto } from '@shared/types';
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

const update: ControllerWithAuth<void, PlaceUpdateDto> = async (req, res) => {
  try {
    await PlaceService.update({
      ...req.body,
      id: Number(req.params.id),
    });

    ok(res, { message: 'Центр обновлен' });
  } catch (err) {
    fail(res, 'Не удалось обновить центр');
  }
};

const findById: Controller<MeetExtendedDto> = async (req, res) => {
  try {
    console.log('findById');

    const place = await PlaceService.findById(Number(req.params.id));

    if (!place) {
      fail(res, 'Место не найдено', 404);
    }

    ok(res, place);
  } catch (err) {
    fail(res, 'Ошибка при получении места');
  }
};

const dashboard: ControllerWithAuth<PlaceDashboardDto> = async (req, res) => {
  try {
    console.log('dashboard');
    const place = await PlaceService.getDashboard(Number(req.viewer?.placeId!));

    if (!place) {
      fail(res, 'Место не найдено', 404);
    }

    ok(res, place);
  } catch (err) {
    fail(res, 'Ошибка при получении dashboard');
  }
};

export default {
  findAll,
  create,
  update,
  findById,
  dashboard,
};
