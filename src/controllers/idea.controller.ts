import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import type { Response } from 'express';
import { IdeaError } from '../services/idea.validation.js';
import { IdeaService } from '../services/idea.service.js';
import type { GetIdeasQuery, IdeaDto, PageMeta } from 'entities';

function resolveId(id: string): number | string { return /^\d+$/.test(id) ? Number(id) : id; }
function failure(res: Response, error: unknown): void {
  if (error instanceof IdeaError) res.status(error.status).json({ error: true, message: error.message });
  else if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') res.status(409).json({ error: true, message: 'Stable idea or photo ID already exists' });
  else { console.error('Idea operation failed', error); res.status(500).json({ error: true, message: 'Idea operation failed' }); }
}

const create: ControllerWithAuth<number, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.status(201).json(await IdeaService.create(req.passport, req.body, req.viewer?.userId)); }
  catch (error) { failure(res, error); }
};
const update: ControllerWithAuth<IdeaDto, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.json(await IdeaService.update(req.passport, resolveId(req.params.id), req.body)); }
  catch (error) { failure(res, error); }
};
const importCatalog: ControllerWithAuth<{ ideas: number; photos: number }, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.json(await IdeaService.importCatalog(req.body, req.passport.id)); }
  catch (error) { failure(res, error); }
};

const findAllPublic: Controller<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll(req.query as GetIdeasQuery);
  ok(res, ideas);
};

const findByUserId: ControllerWithAuth<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll({
    userId: Number(req.viewer?.userId),
  });

  ok(res, ideas);
};

const findById: Controller<IdeaDto> = async (req, res) => {
  try {
    const idea = await IdeaService.findByIdDashboard(resolveId(req.params.id));

    if (!idea) {
      res.status(404).json({ error: true, message: 'Идея не найдена' });
      return;
    }

    ok(res, idea);
  } catch (error) {
    failure(res, error);
  }
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
  try {
    const idea = await IdeaService.generateIdeaImage(existing.id);

    if (!idea) {
      res.status(404).json({ error: true, message: 'Идея не найдена' });
      return;
    }

    ok(res, { message: 'Изображение проекта обновлено' });
  } catch (error) {
    failure(res, error);
  }
};

const meta: Controller<PageMeta> = async (req, res) => {
  try {
    const meta = await IdeaService.meta(resolveId(req.params.id));
    ok(res, meta);
  } catch (error) {
    failure(res, error);
  }
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
