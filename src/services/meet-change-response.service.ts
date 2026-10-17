import { db } from '../utils/dbNext.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { MeetChangeParticipantRepository } from '../repositories/meet-change-participant.repository.js';
import { RefundService } from './refund.service.js';
import { NotificationService } from './notification.service.js';
import { HttpError } from '../utils/http-error.js';
export class MeetChangeResponseService {
  private static async own(passportId: number,userId: number) {
    if (!(await UserRepository.findByPassportId(passportId)).some(u => u.id === userId)) throw new HttpError('Нет доступа к участнику',403);
  }
  static async get(meetId: number,passportId: number,userId: number) {
    await this.own(passportId,userId);
    const meet = await MeetRepository.findById(meetId);
    if (!meet) throw new HttpError('Встреча не найдена',404);
    return { revision:meet.bookingRevision ?? 0,...await MeetChangeParticipantRepository.get(meetId,meet.bookingRevision ?? 0,userId) };
  }
  static async respond(meetId: number,passportId: number,userId: number,revision: number,accepted: boolean) {
    await this.own(passportId,userId);
    return db.transaction(async conn => {
      const meet = await MeetRepository.findById(meetId,conn);
      if (!meet || meet.deletedAt) throw new HttpError('Встреча не найдена',404);
      if (meet.bookingRevision !== revision || meet.status !== 'published') throw new HttpError('Условия изменились или площадка ещё не подтверждена. Обновите страницу.',409);
      const changed = await MeetChangeParticipantRepository.respond(meetId,revision,userId,accepted ? 'accepted' : 'declined',conn);
      if (!changed) return;
      if (!accepted) {
        await MeetUserRepository.delete({ meetId,userId },conn);
        await RefundService.enqueueForMeet(meetId,userId,conn);
      }
      await NotificationService.notify([meet.passportId],`meet-${meetId}-${revision}-response-${userId}`,'Ответ участника на перенос',accepted ? 'Семья подтвердила участие' : 'Семья отказалась от участия; оплаченные места поставлены в очередь возврата',`/project/${meet.projectId}#meet-${meetId}`,conn);
    });
  }
}
