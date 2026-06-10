import { ControllerWithAuth, fail, ok } from './helper.js';
import { MessageService } from '../services/message.service.js';
import { MessageDto, PassportDto } from '@shared/types';


const create: ControllerWithAuth<{ chatId: number; message: MessageDto }> = async (req, res) => {
  try {
    const result = await MessageService.create(req.body as any, req.passport!);

    ok(res, result);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось отправить сообщение');
  }
};

export default {
  create,
};
