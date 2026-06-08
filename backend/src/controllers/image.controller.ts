import { ControllerWithAuth, ok, fail } from './helper.js';
import { FileService } from '../services/file.service.js';

const upload: ControllerWithAuth<{ url: string }> = async (req, res) => {
  try {
    const url = await FileService.upload(req);

    ok(res, { url });
  } catch (err) {
    fail(res, 'Ошибка при загрузке файла');
  }
};

export default {
  upload,
};
