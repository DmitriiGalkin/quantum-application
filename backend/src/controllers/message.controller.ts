import { ControllerWithAuth, fail, ok } from './helper.js';
import { MessageService } from '../services/message.service.js';
import { type CreateMessage, MessageDto } from '@shared/types';


const create: ControllerWithAuth<{ chatId: number; message: MessageDto; data?: any[] }, CreateMessage> = async (req, res) => {
  try {
    const result = await MessageService.create(req.body, req.passport!);

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось отправить сообщение');
  }
};

export default {
  create,
};
