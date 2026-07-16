import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { ProjectService } from '../services/project.service.js';
import { CreateProject, PageMeta, ProjectDto, type ProjectFullDto } from '@shared/types';

const create: ControllerWithAuth<number, CreateProject> = async (req, res) => {
  try {
    const id = await ProjectService.create(req.passport!, req.body);
    ok(res, id);
  } catch (err) {
    fail(res, 'Ошибка при создании проекта');
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

const findByUserId: ControllerWithAuth<ProjectFullDto[]> = async (req, res) => {
  const projects = await ProjectService.findAll({
    ...req.query,
    userId: req.params.id,
  });

  ok(res, projects);
};

const findByPassportId: ControllerWithAuth<ProjectDto[]> = async (req, res) => {
  const projects = await ProjectService.findAll({
    ...req.query,
    passportId: req.passport.id,
  });


  ok(res, projects);
};

const findById: ControllerWithAuth<ProjectFullDto> = async (req, res) => {
  try {
    const data = await ProjectService.findById(Number(req.params.id), Number(req.query.userId));

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
  delete: remove,
  findAll,
  findByUserId,
  findById,
  findByPassportId,
  meta,
};
