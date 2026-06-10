import { ControllerWithAuth, ok, fail, Controller } from './helper.js';
import { ChatService } from '../services/chat/chat.service.js';
import { MessageDto } from '@shared/types';

const create: ControllerWithAuth<number> = async (req, res) => {
  try {
    const chatId = await ChatService.create(req.body, req.passport!);

    ok(res, chatId);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать новый чат');
  }
};

const findMessages: Controller<MessageDto[]> = async (req, res) => {
  try {
    const result = await ChatService.findMessages(Number(req.params.id));

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось получить сообщения');
  }
};

export default {
  create,
  findMessages,
};
