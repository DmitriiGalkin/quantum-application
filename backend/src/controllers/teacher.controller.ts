import { ControllerWithAuth, fail, ok } from './helper.js';
import { TeacherDashboardDto } from '@shared/types';
import { TeacherService } from '../services/teacher.service.js';

const dashboard: ControllerWithAuth<TeacherDashboardDto> = async (req, res) => {
  try {
    const dashboard = await TeacherService.getDashboard(req.passport.id!);

    ok(res, dashboard);
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};

export default {
  dashboard,
};