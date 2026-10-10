import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import type { TeacherDashboardDto, TeacherPublicDto } from 'entities';
import { TeacherService } from '../services/teacher.service.js';

const dashboard: ControllerWithAuth<TeacherDashboardDto> = async (req, res) => {
  const dashboard = await TeacherService.getDashboard(req.passport.id!);

  ok(res, dashboard);
};

const getTeacher: Controller<TeacherPublicDto> = async (req, res) => {
  const teacherId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const teacher = await TeacherService.findById(teacherId);

  ok(res, teacher);
};

export default {
  dashboard,
  getTeacher,
};