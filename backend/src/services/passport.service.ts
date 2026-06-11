import { Meta } from './chat/chat.meta.js';
import PassportRepository from '../repositories/passport.repository.js';

export class PassportService {
  static async updateFromMeta(meta: Meta) {
    console.log('PassportService.updateFromMeta', meta);
    // если мы еще ничего не знали о пасспорте как о учителе, то надо сохранить информацию об этом
    if (meta.passport?.description === null && meta.teacher?.description){
      console.log('PassportService.updateFromMeta.update');
      // сохраняем то что мы узнали о пасспорте
      await PassportRepository.update(meta.passport.id, { description: meta.teacher.description });
    }
  }
}
