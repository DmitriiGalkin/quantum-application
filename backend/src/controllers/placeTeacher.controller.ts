import PlaceTeacherService from '../services/placeTeacher.service.js';
import { ControllerWithAuth, fail, ok } from './helper.js';

type AddTeacherBody = {
  passportId: number;
};

const addTeacher: ControllerWithAuth<number, AddTeacherBody> = async (req, res) => {
  try {
    const placeId = await PlaceTeacherService.resolveAdminPlace(req.passport.id!);

    const id = await PlaceTeacherService.addTeacher(placeId, req.body.passportId);

    ok(res, id);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось добавить учителя');
  }
};

const findAll: ControllerWithAuth<number> = async (req, res) => {
  try {
    const placeId = await PlaceTeacherService.resolveAdminPlace(req.passport.id!);

    const data = await PlaceTeacherService.findAll(placeId);


    ok(res, data);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось получить учителей');
  }
};

const remove: ControllerWithAuth<number> = async (req, res) => {
  try {
    const placeId = await PlaceTeacherService.resolveAdminPlace(req.passport.id!);
    const passportId = Number(req.params.passportId);

    await PlaceTeacherService.remove(placeId, passportId);

    ok(res, true);
  } catch (err) {
    console.log(err);
    fail(res, 'Не удалось удалить учителя');
  }
};

export default {
  addTeacher,
  findAll,
  remove,
};
