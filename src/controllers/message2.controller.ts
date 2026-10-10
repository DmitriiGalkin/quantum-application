import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, fail, ok } from './helper.js';
import { Message2Service } from '../services/message2.service.js';
import type { CreateMessageRequest, Message, UpdateMessageRequest } from 'entities';

const create: ControllerWithAuth<Message, CreateMessageRequest> = async (req, res) => {
  const conversationId = requireId(req.params.id);

  const message = await Message2Service.create(conversationId, req.passport.id, req.body);
  ok(res, message);
};

const update: ControllerWithAuth<void, UpdateMessageRequest> = async (req, res) => {
  const id = requireId(req.params.id);

  const success = await Message2Service.update(id, req.body, req.passport.id);
  if (!success) return fail('Сообщение не найдено', 404);

  ok(res);
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  const id = requireId(req.params.id);

  const success = await Message2Service.delete(id, req.passport.id);
  if (!success) return fail('Сообщение не найдено', 404);

  ok(res);
};

export default {
  create,
  update,
  remove,
};
