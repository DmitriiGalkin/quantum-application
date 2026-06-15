import { Context } from '../../chat/chat.meta.js';
import MeetRepository from '../../../repositories/meet.repository.js';

export class MeetFlowService {
  static async create(context: Context) {
    return await MeetRepository.create({
      ...context.draftMeet!,
      projectId: context.project!.id,
      passportId: context.passport!.id,
    });
  }
}
