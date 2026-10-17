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
    const admins = (await Promise.all([...new Set([previous.placeId,next.placeId])].map(id => PlacePassportRepository.members(id)))).flat().filter(p => p.role === 'admin').map(p => p.passportId);
    const title = next.status === 'cancelled' ? 'Встреча отменена' : next.bookingState === 'needs_location' ? 'Бронирование отменено — ищем новую площадку' : 'Условия встречи изменились';
    await NotificationService.notify([next.passportId,...admins,...families.map(u => u.passportId)],`meet-${next.id}-change-${next.bookingRevision}`,title,reason,`/project/${next.projectId}#meet-${next.id}`,conn);
  }
}
