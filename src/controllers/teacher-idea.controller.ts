import { ControllerWithAuth, fail, ok } from './helper.js';
import { Idea } from '../entities/idea.js';
import { TeacherIdeaService } from '../services/teacher-idea.service.js';

const findByTeacher: ControllerWithAuth<Idea[]> = async (req, res) => {
  try {
    const passportId = req.passport.id;

    const ideas = await TeacherIdeaService.findIdeasByTeacher(passportId);

    ok(res, ideas);
  } catch (err) {
    fail(res, 'Не удалось получить посещения');
  }
};

export default {
  findByTeacher,
};
