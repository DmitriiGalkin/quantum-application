import { beforeEach, expect, it, vi } from 'vitest';
import type { Meet } from 'entities';

vi.mock('../repositories/booking-change.repository.js', () => ({ BookingChangeRepository: { create: vi.fn() } }));
vi.mock('../repositories/meet-change-participant.repository.js', () => ({ MeetChangeParticipantRepository: { create: vi.fn() } }));
vi.mock('../repositories/meet-user.repository.js', () => ({ default: { findParticipants: vi.fn() } }));
vi.mock('../repositories/user.repository.js', () => ({ default: { findByIds: vi.fn() } }));
vi.mock('../repositories/place-passport.repository.js', () => ({ default: { members: vi.fn() } }));
vi.mock('./notification.service.js', () => ({ NotificationService: { notify: vi.fn() } }));

import { BookingChangeService } from './booking-change.service.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { NotificationService } from './notification.service.js';

const previous: Meet = { id: 9, projectId: 3, passportId: 42, placeId: 7, locationId: 2,
  maxParticipants: 8, price: 500, duration: 60, startedAt: '2099-01-05 10:00:00', status: 'published', deletedAt: null,
  bookingRevision: 0, bookingState: 'confirmed' };
const conn = {} as Parameters<typeof BookingChangeService.announce>[4];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(MeetUserRepository.findParticipants).mockResolvedValue([{ userId: 5 }] as Awaited<ReturnType<typeof MeetUserRepository.findParticipants>>);
  vi.mocked(UserRepository.findByIds).mockResolvedValue([{ id: 5, passportId: 30 }] as Awaited<ReturnType<typeof UserRepository.findByIds>>);
  vi.mocked(PlacePassportRepository.members).mockResolvedValue([{ passportId: 50, role: 'admin' }]);
});

it('sends a repeat request to the centre and a move notice to enrolled families', async () => {
  await BookingChangeService.announce(previous, { ...previous, startedAt: '2099-01-05 11:00:00', status: 'pending', bookingState: 'requested', bookingRevision: 1 }, 42, 'Новое время', conn);
  expect(NotificationService.notify).toHaveBeenCalledWith([50], 'meet-9-change-1-request', 'Заявка на зал', expect.stringContaining('Новое время'), '/place/meets', conn);
  expect(NotificationService.notify).toHaveBeenCalledWith([30], 'meet-9-change-1-family', 'Встреча перенесена', expect.stringContaining('Новое время'), '/project/3#meet-9', conn);
  expect(NotificationService.notify).not.toHaveBeenCalledWith([42], expect.anything(), expect.anything(), expect.anything(), expect.anything(), conn);
});

it('distinguishes cancelling the booking from cancelling the meeting', async () => {
  await BookingChangeService.announce(previous, { ...previous, status: 'pending', locationId: null, bookingState: 'needs_location', bookingRevision: 1 }, 50, 'Зал закрыт', conn);
  expect(NotificationService.notify).toHaveBeenCalledWith([42], 'meet-9-change-1-teacher', 'Бронирование зала отменено', expect.anything(), '/project/3#meet-9', conn);
  expect(NotificationService.notify).toHaveBeenCalledWith([30], 'meet-9-change-1-family', 'Для встречи ищут новую площадку', expect.anything(), '/project/3#meet-9', conn);
  vi.mocked(NotificationService.notify).mockClear();
  await BookingChangeService.announce(previous, { ...previous, status: 'cancelled', bookingRevision: 2 }, 42, 'Встреча отменена', conn);
  expect(NotificationService.notify).toHaveBeenCalledWith([30], 'meet-9-change-2-family', 'Встреча отменена', expect.anything(), '/project/3#meet-9', conn);
});
