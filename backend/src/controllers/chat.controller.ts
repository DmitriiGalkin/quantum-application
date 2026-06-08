import { ControllerWithAuth, ok, fail } from './helper.js';
import { ChatService } from '../services/chat.service.js';

const create: ControllerWithAuth<unknown> = async (req, res) => {
  try {
    const chatId = await ChatService.create(req.passport!, req.body);

    ok(res, { chatId });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать новый чат');
  }
};

const createMessage: ControllerWithAuth<unknown> = async (req, res) => {
  try {
    const result = await ChatService.createMessage(req.passport!, req.body);

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось отправить сообщение');
  }
};

const findMessages: ControllerWithAuth<unknown> = async (req, res) => {
  try {
    const result = await ChatService.findMessages(req.passport!, req.params.id);

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось получить сообщения');
  }
};

const findAll: ControllerWithAuth<unknown> = async (req, res) => {
  try {
    const chats = await ChatService.findAll(req.passport!);

    ok(res, chats);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось получить список чатов');
  }
};

export default {
  create,
  createMessage,
  findMessages,
  findAll,
};
