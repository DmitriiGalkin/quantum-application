import { ControllerWithAuth, ok, fail, Controller } from './helper.js';
import { ProjectService } from '../services/project.service.js';
import { IdeaService } from '../services/idea.service.js';
import { toIdeaDto } from '../mappers/idea.mapper.js';
import { toProjectDto } from '../mappers/project.mapper.js';
import { PageMeta, ProjectDto } from '@shared/types';

const create: ControllerWithAuth<number> = async (req, res) => {
  try {
    const id = await ProjectService.create(req.passport!, req.body);
    ok(res, id);
  } catch (err) {
    fail(res, 'Ошибка при создании проекта');
  }
};

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await ProjectService.update(Number(req.params.id), req.body);
    ok(res, { message: 'Проект обновлен' });
  } catch (err) {
    fail(res, 'Не удалось обновить проект');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    await ProjectService.remove(Number(req.params.id), req.passport!);
    ok(res, { message: 'Проект удален' });
  } catch (err) {
    fail(res, 'Не удалось удалить проект');
  }
};

const findAll: Controller<ProjectDto[]> = async (req, res) => {
  try {
    const data = await ProjectService.findAll(req.query);

    ok(res, data);
  } catch (err) {
    fail(res, 'Не удалось получить проекты');
  }
};

const findByUserId: ControllerWithAuth<ProjectDto[]> = async (req, res) => {
  const ideas = await ProjectService.findAll({
    ...req.query,
    userId: req.params.id,
  });

  ok(res, ideas.map(toProjectDto));
};

const findByPassportId: ControllerWithAuth<ProjectDto[]> = async (req, res) => {
  const ideas = await ProjectService.findAll({
    ...req.query,
    passportId: req.passport.id,
  });

  ok(res, ideas.map(toProjectDto));
};

const findById: Controller<ProjectDto> = async (req, res) => {
  try {
    const data = await ProjectService.findById(Number(req.params.id));
    if (!data) return fail(res, 'Проект не найден', 404);

    ok(res, data);
  } catch (err) {
    fail(res, 'Не удалось получить проект');
  }
};

const meta: Controller<PageMeta> = async (req, res) => {
  try {
    const meta = await ProjectService.meta(Number(req.params.id));
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
  findByUserId,
  findById,
  findByPassportId,
  meta,
};
