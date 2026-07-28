import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { Message2Service } from '../services/message2.service.js';
import { CreateMessageRequest, UpdateMessageRequest, Message } from '@shared/types';

const create: ControllerWithAuth<Message, CreateMessageRequest> = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    if (isNaN(conversationId)) return fail(res, 'Некорректный ID диалога', 400);
    
    const message = await Message2Service.create(conversationId, req.body);
    ok(res, message);
  } catch (error) {
    fail(res, 'Ошибка при создании сообщения');
  }
};

const update: ControllerWithAuth<void, UpdateMessageRequest> = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, 'Некорректный ID сообщения', 400);
    
    const success = await Message2Service.update(id, req.body);
    if (!success) return fail(res, 'Сообщение не найдено', 404);
    
    ok(res);
  } catch (error) {
    fail(res, 'Ошибка при обновлении сообщения');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, 'Некорректный ID сообщения', 400);
    
    const success = await Message2Service.delete(id);
    if (!success) return fail(res, 'Сообщение не найдено', 404);
    
    ok(res);
  } catch (error) {
    fail(res, 'Ошибка при удалении сообщения');
  }
};

export default {
  create,
  update,
  remove
};


export default {
  createMessage,
  updateMessage,
  deleteMessage
};