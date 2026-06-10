import { ControllerWithAuth, ok, fail, Controller } from './helper.js';
import { toIdeaDto } from '../mappers/idea.mapper.js';
import { IdeaService } from '../services/idea.service.js';
import { ProjectService } from '../services/project.service.js';
import { IdeaDto, PageMeta } from '@shared/types';

const findAllPublic: Controller<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll(req.query);
  ok(res, ideas.map(toIdeaDto));
};

const findByUserId: ControllerWithAuth<IdeaDto[]> = async (req, res) => {
  const ideas = await IdeaService.findAll({
    ...req.query,
    userId: req.params.id,
  });

  ok(res, ideas.map(toIdeaDto));
};

const findById: Controller<IdeaDto> = async (req, res) => {
  try {
    const idea = await IdeaService.findById(Number(req.params.id));

    if (!idea) {
      fail(res, 'Идея не найдена', 404);
    }

    ok(res, toIdeaDto(idea));
  } catch (err) {
    fail(res, 'Не удалось получить идею');
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