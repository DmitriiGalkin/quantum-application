import type { Meet } from 'entities';
import type { PoolConnection } from 'mysql2/promise';
import { BookingChangeRepository } from '../repositories/booking-change.repository.js';
import { MeetChangeParticipantRepository } from '../repositories/meet-change-participant.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { NotificationService } from './notification.service.js';
import { HttpError } from '../utils/http-error.js';

export function changeReason(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 2000) throw new HttpError('Укажите причину (до 2000 символов)',400);
  return value.trim();
}
export class BookingChangeService {
  static async announce(previous: Meet, next: Meet, actor: number, reason: string, conn: PoolConnection) {
    await BookingChangeRepository.create(previous,next,actor,reason,conn);
    const joins = await MeetUserRepository.findParticipants(next.id,conn);
    const families = await UserRepository.findByIds(joins.map(j => j.userId));
    await MeetChangeParticipantRepository.create(next.id,next.bookingRevision ?? 0,joins.map(j => j.userId),conn);
    const revision = next.bookingRevision ?? 0;
    const baseKey = `meet-${next.id}-change-${revision}`;
    const destinationAdmins = (await PlacePassportRepository.members(next.placeId,conn))
      .filter(member => member.role === 'admin' && member.passportId !== actor).map(member => member.passportId);
    if (next.status === 'pending' && next.bookingState === 'requested') {
      await NotificationService.notify(destinationAdmins,`${baseKey}-request`,'Заявка на зал',
        `Преподаватель обновил заявку на встречу #${next.id}. ${reason}`, '/place/meets',conn);
    }
    if (previous.placeId !== next.placeId || next.status === 'cancelled' || next.bookingState === 'needs_location') {
      const previousAdmins = (await PlacePassportRepository.members(previous.placeId,conn))
        .filter(member => member.role === 'admin' && member.passportId !== actor).map(member => member.passportId);
      await NotificationService.notify(previousAdmins,`${baseKey}-centre`,
        next.status === 'cancelled' ? 'Встреча отменена' : 'Бронирование зала изменилось',
        `Встреча #${next.id}. ${reason}`,'/place/meets',conn);
    }
    if (actor !== next.passportId) {
      await NotificationService.notify([next.passportId],`${baseKey}-teacher`,
        next.status === 'cancelled' ? 'Встреча отменена' : 'Бронирование зала отменено',
        `Встреча #${next.id}. ${reason}`,`/project/${next.projectId}#meet-${next.id}`,conn);
    }
    const familyTitle = next.status === 'cancelled' ? 'Встреча отменена'
      : next.bookingState === 'needs_location' ? 'Для встречи ищут новую площадку' : 'Встреча перенесена';
    await NotificationService.notify(families.map(user => user.passportId),`${baseKey}-family`,familyTitle,
      `Встреча #${next.id}. ${reason}`,`/project/${next.projectId}#meet-${next.id}`,conn);
  }
}
