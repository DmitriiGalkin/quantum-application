import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { IdeaService } from '../services/idea.service.js';
import type { CreateIdea, GetIdeasQuery, IdeaDto, PageMeta } from 'entities';

const create: ControllerWithAuth<number, CreateIdea> = async (req, res) => {
  try {
    const id = await IdeaService.create(req.passport!, req.body, req.viewer?.userId);
    ok(res, id);
  } catch (err) {
    fail(res, 'Ошибка при создании идеи');
  }
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
    const idea = await IdeaService.findByIdDashboard(Number(req.params.id));

    if (!idea) {
      return fail(res, 'Идея не найдена', 404);
    }

    ok(res, idea);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось получить идею');
  }
};

const generateImage: ControllerWithAuth<{ message: string }> = async (req, res) => {
  if (!req.passport) {
    res.status(401).json({ error: true, message: 'Необходима авторизация' });
    return;
  }
  const existing = await IdeaService.findById(Number(req.params.id));
  if (!existing) {
    res.status(404).json({ error: true, message: 'Идея не найдена' });
    return;
  }
  if (existing.passportId !== null && existing.passportId !== req.passport.id) {
    res.status(403).json({ error: true, message: 'Изменять идею может только автор' });
    return;
  }
  try {
    const idea = await IdeaService.generateIdeaImage(Number(req.params.id));

    if (!idea) {
      fail(res, 'Идея не найдена', 404);
    }

    ok(res, { message: 'Изображение проекта обновлено' });
  } catch (err) {
    fail(res, 'Не удалось сгенерировать изображение');
  }
};

const meta: Controller<PageMeta> = async (req, res) => {
  try {
    const meta = await IdeaService.meta(Number(req.params.id));
    ok(res, meta);
  } catch (err) {
    fail(res, 'Не удалось получить meta проекта');
  }
};

export default {
  create,
  findAllPublic,
  findByUserId,
  findById,
  generateImage,
  meta,
};
