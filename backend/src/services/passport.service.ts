import { Meta } from './chat/chat.meta.js';
import PassportRepository from '../repositories/passport.repository.js';

export class PassportService {
  static async updateFromMeta(meta: Meta) {
    if (meta.passport?.description === null && meta.teacher?.description){
      await PassportRepository.update(meta.passport.id, { description: meta.teacher.description });
    }
  }
}
