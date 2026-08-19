import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { toIdeaExtendedDto, toIdeaFullDto } from '../mappers/idea.mapper.js';
import { IdeaService } from '../services/idea.service.js';
import { CreateIdea, GetIdeasQuery, IdeaDto, IdeaExtendedDto, PageMeta } from 'types';

const create: ControllerWithAuth<number, CreateIdea> = async (req, res) => {
  try {
    const id = await IdeaService.create(req.passport!, req.body, req.viewer?.userId);
    ok(res, id);
  } catch (err) {
    fail(res, 'Ошибка при создании идеи');
  }
};

const findAllPublic: Controller<IdeaExtendedDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll(req.query as GetIdeasQuery);
  ok(res, ideas.map(toIdeaExtendedDto));
};

const findByUserId: ControllerWithAuth<IdeaExtendedDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll({
    userId: Number(req.viewer?.userId),
  });

  ok(res, ideas.map(toIdeaExtendedDto));
};

const findById: Controller<IdeaDto> = async (req, res) => {
  try {
    const idea = await IdeaService.findById(Number(req.params.id), req.query as GetIdeasQuery);

    if (!idea) {
      return fail(res, 'Идея не найдена', 404);
    }

    ok(res, toIdeaFullDto(idea));
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось получить идею');
  }
};

const generateImage: ControllerWithAuth<{ message: string }> = async (req, res) => {
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
