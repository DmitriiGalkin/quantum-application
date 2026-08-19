import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import type { CreateMeet, GetMeetsQuery, MeetExtendedDto } from 'types';
import { MeetService } from '../services/meet.service.js';

const create: ControllerWithAuth<number, CreateMeet> = async (req, res) => {
  try {
    const meetId = await MeetService.create(req.passport!, req.body);

    ok(res, meetId);
  } catch (err) {
    fail(res, 'Не удалось создать встречу');
  }
};

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await MeetService.update({
      id: Number(req.params.id),
      ...req.body,
    });

    ok(res, { message: 'Встреча обновлена' });
  } catch (err) {
    fail(res, 'Не удалось обновить встречу');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    const meet = await MeetService.findById(Number(req.params.id));

    if (!meet) {
      return fail(res, 'Встреча не существует', 404);
    }

    if (meet.passport.id !== req.passport!.id) {
      return fail(res, 'Нет прав на удаление', 403);
    }

    await MeetService.remove(Number(req.params.id));

    ok(res, { message: 'Встреча удалена' });
  } catch (err) {
    fail(res, 'Не удалось удалить встречу');
  }
};


const findAll: Controller<MeetExtendedDto[]> = async (req, res) => {
  try {
    const meets = await MeetService.findAll({
      ...req.query,
    } as GetMeetsQuery);

    ok(res, meets);
  } catch (err) {
    fail(res, 'Ошибка при получении списка встреч');
  }
};

const findByUserId: ControllerWithAuth<MeetExtendedDto[]> = async (req, res) => {
  try {
    const meets = await MeetService.findAll({ userId: req.viewer?.userId });

    ok(res, meets);
  } catch (err) {
    fail(res, 'Ошибка при получении приватного списка встреч ученика');
  }
};

const findPassportAll: ControllerWithAuth<MeetExtendedDto[]> = async (req, res) => {
  try {
    const meets = await MeetService.findAll({
      ...req.query,
      passportId: req.passport!.id,
    });

    ok(res, meets);
  } catch (err) {
    fail(res, 'Ошибка при получении списка встреч');
  }
};

const findById: Controller<MeetExtendedDto> = async (req, res) => {
  try {
    const meet = await MeetService.findById(Number(req.params.id));

    if (!meet) {
      fail(res, 'Встреча не найдена', 404);
    }

    ok(res, meet);
  } catch (err) {
    fail(res, 'Ошибка при получении встречи');
  }
};

const updateStatus: ControllerWithAuth<void> = async (req, res) => {
  try {
    await MeetService.updateStatus(Number(req.params.id), req.body.status);

    ok(res, '1');
  } catch (err) {
    fail(res, 'Ошибка при получении встречи');
  }
};

const getPlaceMeets: ControllerWithAuth<MeetExtendedDto[]> = async (req, res) => {
  try {
    const meets = await MeetService.findAll({
      ...req.query,
      placeId: req.viewer?.placeId,
    } as GetMeetsQuery);

    ok(res, meets);
  } catch (err) {
    fail(res, 'Ошибка при получении списка встреч');
  }
};

export default {
  create,
  update,
  delete: remove,
  findAll,
  findPassportAll,
  findById,
  updateStatus,
  getPlaceMeets,
  findByUserId,
};
