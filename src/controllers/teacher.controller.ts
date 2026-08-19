import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { TeacherDashboardDto, TeacherPublicDto } from 'types';
import { TeacherService } from '../services/teacher.service.js';

const dashboard: ControllerWithAuth<TeacherDashboardDto> = async (req, res) => {
  try {
    const dashboard = await TeacherService.getDashboard(req.passport.id!);

    ok(res, dashboard);
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};

const getTeacher: Controller<TeacherPublicDto> = async (req, res) => {
  try {
    const teacherId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const teacher = await TeacherService.findById(teacherId);

    ok(res, teacher);
  } catch (err) {
    fail(res, 'Ошибка получения информации о учителе');
  }
};

export default {
  dashboard,
  getTeacher,
};