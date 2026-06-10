import { fail, ok } from './helper.js';
import { MessageService } from '../services/message.service.js';


const create = async (req, res) => {
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
