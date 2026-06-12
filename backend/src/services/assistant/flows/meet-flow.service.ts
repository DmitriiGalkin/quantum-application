import { Meta } from '../../chat/chat.meta.js';
import MeetRepository from '../../../repositories/meet.repository.js';

export class MeetFlowService {
  static async create(meta: Meta) {
    return await MeetRepository.create({
      ...meta.meet!,
      projectId: meta.project!.id,
      passportId: meta.passport!.id,
    });
  }
}
