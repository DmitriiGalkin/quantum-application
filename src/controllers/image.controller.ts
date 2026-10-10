import { type ControllerWithAuth, fail, ok } from './helper.js';
import { FileService } from '../services/file.service.js';

const upload: ControllerWithAuth<{ url: string }> = async (req, res) => {
  if (!req.passport) {
    res.status(401).json({ error: true, message: 'Необходима авторизация' });
    return;
  }
  try {
    const url = await FileService.upload(req);

    ok(res, { url });
  } catch {
    fail(res, 'Ошибка при загрузке файла');
  }
};

export default {
  upload,
};
