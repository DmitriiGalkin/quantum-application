import { ControllerWithAuth, fail, ok } from './helper.js';
import { ConversationService } from '../services/conversation.service.js';
import { Conversation, StartConversationRequest } from '@shared/types';

const findAll: ControllerWithAuth<Conversation[]> = async (req, res) => {
  try {
    const conversations = await ConversationService.getConversationList(req.passport!.id);
    ok(res, conversations);
  } catch (error) {
    fail(res, 'Ошибка при получении списка диалогов');
  }
};

const start: ControllerWithAuth<Conversation, StartConversationRequest> = async (req, res) => {
  try {
    const conversation = await ConversationService.startConversation({
      passportId: req.passport!.id,
      ...req.body
    });
    ok(res, conversation);
  } catch (error) {
    fail(res, 'Ошибка при создании диалога');
  }
};

const findById: ControllerWithAuth<void> = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return fail(res, 'Некорректный ID диалога', 400);
    
    const history = await ConversationService.getConversationHistory(id);
    if (!history) return fail(res, 'Диалог не найден', 404);
    
    ok(res, history);
  } catch (error) {
    fail(res, 'Ошибка при получении истории диалога');
  }
};

export default {
  findAll,
  start,
  findById
};
