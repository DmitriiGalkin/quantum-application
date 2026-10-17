import { requireId } from '../utils/validation.js';
import { type ControllerWithAuth, fail, ok } from './helper.js';
import { ConversationService } from '../services/conversation.service.js';
import type { Conversation, ConversationHistory, StartConversationRequest, StartConversationResponse } from 'entities';

const findAll: ControllerWithAuth<Conversation[]> = async (req, res) => {
  const conversations = await ConversationService.getConversationList(req.passport!.id);
  ok(res, conversations);
};

const start: ControllerWithAuth<StartConversationResponse, Partial<StartConversationRequest>> = async (req, res) => {
  const conversation = await ConversationService.startConversation({
    targetPassportId: requireId(req.body.targetPassportId ?? req.body.passportId),
    passportId: req.passport.id,
  });
  ok(res, conversation);
};

const findById: ControllerWithAuth<ConversationHistory> = async (req, res) => {
  const id = requireId(req.params.id);

  const history = await ConversationService.getConversationHistory(id, req.passport.id);
  if (!history) return fail('Диалог не найден', 404);

  ok(res, history);
};

const acknowledge: ControllerWithAuth<unknown,{ messageId: number; read: boolean }> = async (req,res) => {
  await ConversationService.acknowledge(requireId(req.params.id),req.passport.id,requireId(req.body.messageId),req.body.read === true);
  ok(res,true);
};
export default {
  acknowledge,
  findAll,
  start,
  findById,
};
