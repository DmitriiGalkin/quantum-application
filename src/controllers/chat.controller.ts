import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { ChatService } from '../services/chat/chat.service.js';
import { CreateChatBody, type CreateChatMessages, MessageDto } from 'types';

const create: ControllerWithAuth<number, CreateChatBody> = async (req, res) => {
  try {
    const chatId = await ChatService.create(req.body, req.passport!);

    ok(res, chatId);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать новый чат');
  }
};

const createMessages: ControllerWithAuth<MessageDto[], CreateChatMessages> = async (req, res) => {
  try {
    const result = await ChatService.createMessages(Number(req.params.id), req.body, req.passport!);

    ok(res, result);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать сообщения');
  }
};

const findMessages: Controller<MessageDto[]> = async (req, res) => {
  try {
    const result = await ChatService.findMessages(Number(req.params.id));

    ok(res, result);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось получить сообщения');
  }
};

export default {
  create,
  createMessages,
  findMessages,
};
