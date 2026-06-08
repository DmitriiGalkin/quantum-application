import { ControllerWithAuth, ok, fail } from './helper.js';
import { MeetDto } from '@shared/types';
import { toMeetDto } from '../mappers/meet.mapper.js';
import { MeetService } from '../services/meet.service.js';

const create: ControllerWithAuth<MeetDto> = async (req, res) => {
  try {
    const meetId = await MeetService.create({
      ...req.body,
      passportId: req.passport!.id,
    });

    ok(res, { id: meetId });
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

    if (meet.passportId !== req.passport!.id) {
      return fail(res, 'Нет прав на удаление', 403);
    }

    await MeetService.remove(Number(req.params.id));

    ok(res, { message: 'Встреча удалена' });
  } catch (err) {
    fail(res, 'Не удалось удалить встречу');
  }
};

const findAll: ControllerWithAuth<MeetDto[]> = async (req, res) => {
  try {
    const meets = await MeetService.findAll({
      ...req.query,
      passportId: req.passport!.id,
    });

    const dto = meets.map(toMeetDto);

    ok(res, dto);
  } catch (err) {
    fail(res, 'Ошибка при получении списка встреч');
  }
};

const findById: ControllerWithAuth<MeetDto> = async (req, res) => {
  try {
    const meet = await MeetService.findById(Number(req.params.id));

    if (!meet) {
      return fail(res, 'Встреча не найдена', 404);
    }

    ok(res, toMeetDto(meet));
  } catch (err) {
    fail(res, 'Ошибка при получении встречи');
  }
};

export default {
  create,
  update,
  delete: remove,
  findAll,
  findById,
};
