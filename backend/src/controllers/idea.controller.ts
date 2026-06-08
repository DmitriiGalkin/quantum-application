import { ControllerWithAuth, ok, fail } from './helper.js';
import { IdeaDto, IParams } from '@shared/types';
import { toIdeaDto } from '../mappers/idea.mapper.js';
import { IdeaService } from '../services/idea.service.js';

const findAll: ControllerWithAuth<IdeaDto[]> = async (req, res) => {
  try {
    const ideas = await IdeaService.findAll({
      ...req.query,
      passportId: req.passport?.id,
    } as IParams);

    const dto = ideas.map(toIdeaDto);

    ok(res, dto);
  } catch (err) {
    fail(res, 'Не удалось получить список идей');
  }
};

const findById: ControllerWithAuth<IdeaDto> = async (req, res) => {
  try {
    const idea = await IdeaService.findById(Number(req.params.id));

    if (!idea) {
      return fail(res, 'Идея не найдена', 404);
    }

    ok(res, toIdeaDto(idea));
  } catch (err) {
    fail(res, 'Не удалось получить идею');
  }
};

const generateImage: ControllerWithAuth<{ message: string }> = async (req, res) => {
  try {
    const project = await IdeaService.generateProjectImage(Number(req.params.id));

    if (!project) {
      return fail(res, 'Проект не найден', 404);
    }

    ok(res, { message: 'Изображение проекта обновлено' });
  } catch (err) {
    fail(res, 'Не удалось сгенерировать изображение');
  }
};

export default {
  findAll,
  findById,
  generateImage,
};