import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import { IdeaService } from '../services/idea.service.js';
import type { GetIdeasQuery, IdeaDto, PageMeta } from 'entities';

function resolveId(id: string): number | string { return /^\d+$/.test(id) ? requireId(id) : id; }


const create: ControllerWithAuth<number, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  res.status(201).json(await IdeaService.create(req.passport, req.body, req.viewer?.userId));
};
const update: ControllerWithAuth<IdeaDto, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  res.json(await IdeaService.update(req.passport, resolveId(req.params.id), req.body));
};
const importCatalog: ControllerWithAuth<{ ideas: number; photos: number }, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  res.json(await IdeaService.importCatalog(req.body, req.passport.id));
};

const findAllPublic: Controller<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll(req.query as GetIdeasQuery);
  ok(res, ideas);
};

const findByUserId: ControllerWithAuth<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll({
    userId: requireId(req.viewer?.userId),
  });

  ok(res, ideas);
};

const findById: Controller<IdeaDto> = async (req, res) => {
  const idea = await IdeaService.findByIdDashboard(resolveId(req.params.id));

  if (!idea) {
    res.status(404).json({ error: true, message: 'Идея не найдена' });
    return;
  }

  ok(res, idea);
};

const generateImage: ControllerWithAuth<{ message: string }> = async (req, res) => {
  if (!req.passport) {
    res.status(401).json({ error: true, message: 'Необходима авторизация' });
    return;
  }
  const existing = await IdeaService.findById(resolveId(req.params.id));
  if (!existing) {
    res.status(404).json({ error: true, message: 'Идея не найдена' });
    return;
  }
  if (existing.passportId !== null && existing.passportId !== req.passport.id) {
    res.status(403).json({ error: true, message: 'Изменять идею может только автор' });
    return;
  }
  const idea = await IdeaService.generateIdeaImage(existing.id);

  if (!idea) {
    res.status(404).json({ error: true, message: 'Идея не найдена' });
    return;
  }

  ok(res, { message: 'Изображение проекта обновлено' });
};

const meta: Controller<PageMeta> = async (req, res) => {
  const meta = await IdeaService.meta(resolveId(req.params.id));
  ok(res, meta);
};

export default {
  create,
  update,
  importCatalog,
  findAllPublic,
  findByUserId,
  findById,
  generateImage,
  meta,
};
