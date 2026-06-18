import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { toIdeaExtendedDto, toIdeaFullDto } from '../mappers/idea.mapper.js';
import { IdeaService } from '../services/idea.service.js';
import { IdeaDto, IdeaExtendedDto, PageMeta } from '@shared/types';

const findAllPublic: Controller<IdeaExtendedDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll(req.query);
  ok(res, ideas.map(toIdeaExtendedDto));
};

const findByUserId: ControllerWithAuth<IdeaExtendedDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll({
    userId: Number(req.params.id),
  });

  ok(res, ideas.map(toIdeaExtendedDto));
};

const findById: Controller<IdeaDto> = async (req, res) => {
  try {
    const idea = await IdeaService.findById(Number(req.params.id));

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
  findAllPublic,
  findByUserId,
  findById,
  generateImage,
  meta,
};