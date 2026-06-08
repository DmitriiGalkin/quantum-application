import { ControllerWithAuth, ok, fail } from './helper.js';
import { ProjectService } from '../services/project.service.js';

const create = async (req, res) => {
  try {
    const id = await ProjectService.create(req.passport!, req.body);
    ok(res, { message: 'Проект создан', id }, 201);
  } catch (err) {
    fail(res, 'Ошибка при создании проекта');
  }
};

const update = async (req, res) => {
  try {
    await ProjectService.update(req.params.id, req.body);
    ok(res, { message: 'Проект обновлен' });
  } catch (err) {
    fail(res, 'Не удалось обновить проект');
  }
};

const remove = async (req, res) => {
  try {
    await ProjectService.remove(req.passport!, req.params.id);
    ok(res, { message: 'Проект удален' });
  } catch (err) {
    fail(res, 'Не удалось удалить проект');
  }
};

const findAll = async (req, res) => {
  try {
    const data = await ProjectService.findAll({
      ...req.query,
      passportId: req.passport?.id,
    });

    ok(res, data);
  } catch (err) {
    fail(res, 'Не удалось получить проекты');
  }
};

const findById = async (req, res) => {
  try {
    const data = await ProjectService.findById(Number(req.params.id));
    if (!data) return fail(res, 'Проект не найден', 404);

    ok(res, data);
  } catch (err) {
    fail(res, 'Не удалось получить проект');
  }
};

const meta = async (req, res) => {
  try {
    const meta = await ProjectService.meta(req.params.id);
    ok(res, meta);
  } catch (err) {
    fail(res, 'Не удалось получить meta проекта');
  }
};

export default {
  create,
  update,
  delete: remove,
  findAll,
  findById,
  meta,
};
