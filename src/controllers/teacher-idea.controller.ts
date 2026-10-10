import { type ControllerWithAuth, ok } from './helper.js';
import type { Idea } from 'entities';
import { TeacherIdeaService } from '../services/teacher-idea.service.js';

const findByTeacher: ControllerWithAuth<Idea[]> = async (req, res) => {
  const passportId = req.passport.id;

  const ideas = await TeacherIdeaService.findIdeasByTeacher(passportId);

  ok(res, ideas);
};

export default {
  findByTeacher,
};
