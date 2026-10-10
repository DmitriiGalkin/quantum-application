import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { ProjectService } from '../services/project.service.js';
import type { CreateProject, PageMeta, ProjectDto, GetProjectsQuery } from 'entities';

const create: ControllerWithAuth<number, CreateProject> = async (req, res) => {
  const id = await ProjectService.create(req.passport!, req.body);
  ok(res, id);
};

const update: ControllerWithAuth<number, CreateProject> = async (req, res) => {
  const id = await ProjectService.update(requireId(req.params.id), req.body, req.passport.id);
  ok(res, id);
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  await ProjectService.remove(requireId(req.params.id), req.passport!);
  ok(res, { message: 'Проект удален' });
};

const findAll: Controller<ProjectDto[], never, GetProjectsQuery> = async (req, res) => {
  const data = await ProjectService.findAll(req.query);

  ok(res, data);
};

const findByUserId: ControllerWithAuth<ProjectDto[]> = async (req, res) => {
  const projects = await ProjectService.findAll({
    ...req.query,
    userId: requireId(req.viewer?.userId),
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

const findByPlaceId: ControllerWithAuth<ProjectDto[]> = async (req, res) => {
  const projects = await ProjectService.findAll({
    ...req.query,
    placeId: requireId(req.viewer?.placeId),
  });

  ok(res, projects);
};

const findById: Controller<ProjectDto> = async (req, res) => {
  const data = await ProjectService.findById(requireId(req.params.id), req.viewer!);

  if (!data) return fail('Проект не найден', 404);

  ok(res, data);
};

const meta: Controller<PageMeta> = async (req, res) => {
  const meta = await ProjectService.meta(requireId(req.params.id));
  ok(res, meta);
};

export default {
  create,
  update,
  delete: remove,
  findAll,
  findByUserId,
  findById,
  findByPassportId,
  findByPlaceId,
  meta,
};
