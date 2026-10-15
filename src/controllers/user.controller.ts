import { StudentAccessService } from '../services/student-access.service.js';
import type { StartConversationResponse } from 'entities';
import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { UserService } from '../services/user.service.js';
import type { UserDashboardDto, UserDto, CreateUserInput, UpdateUserInput } from 'entities';

type UpdateUserBody = UpdateUserInput;

const create: ControllerWithAuth<number, CreateUserInput> = async (req, res) => {
  const userId = await UserService.create(req.passport!, req.body);

  ok(res, userId);
};

const update: ControllerWithAuth<void, UpdateUserBody> = async (req, res) => {
  await UserService.update(req.passport!, requireId(req.params.id), req.body);

  ok(res, { message: 'Участник успешно обновлен' });
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  await UserService.remove(req.passport!, requireId(req.params.id));

  ok(res, { message: 'Участник и его участия в проектах удалены' });
};

const dashboard: ControllerWithAuth<UserDashboardDto> = async (req, res) => {
  const dashboard = await UserService.getDashboard(requireId(req.viewer?.userId));

  ok(res, dashboard);
};

const findById: Controller<UserDto> = async (req, res) => {
  const user = await UserService.findById(requireId(req.params.id));

  if (!user) {
    fail('Участник не найден', 404);
  }

  ok(res, user);
};

const parentConversation: ControllerWithAuth<StartConversationResponse> = async (req, res) => {
  const result = await StudentAccessService.parentConversation(req.passport.id, requireId(req.params.id),
    req.viewer?.role === 'place' ? requireId(req.viewer.placeId) : undefined);
  ok(res, result);
};

export default {
  parentConversation,
  create,
  update,
  delete: remove,
  findById,
  dashboard,
};
