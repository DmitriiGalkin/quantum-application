import { type ControllerWithAuth, ok } from './helper.js';
import { FileService } from '../services/file.service.js';

const upload: ControllerWithAuth<{ url: string }> = async (req, res) => {
  if (!req.passport) {
    res.status(401).json({ error: true, message: 'Необходима авторизация' });
    return;
  }
  const url = await FileService.uploadImage(req.file);

  ok(res, { url });
};

export default {
  upload,
};
