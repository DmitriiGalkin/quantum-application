import { afterEach, expect, it, vi } from 'vitest';
import type { MeetDto } from '../../../entities/meet.ts';
import { nextProjectMeet, moscowMeetStatus, upcomingPublishedMeets, formatMoscowMeet } from './project-card-meeting.ts';

const meet = (id: number, startedAt: string, overrides: Partial<MeetDto> = {}) => ({ id, startedAt, duration: 60, deletedAt: null, status: 'published', ...overrides }) as MeetDto;
afterEach(() => vi.useRealTimers());
it('chooses the nearest active meeting, including ongoing meetings, with a stable tie order', () => {
  const now = new Date('2026-10-12T13:30:00Z');
  const ongoing = meet(3, '2026-10-12T13:00:00Z');
  const rows = [meet(1, '2026-10-11T13:00:00Z'), meet(2, '2026-10-12T14:00:00Z'),
    meet(5, ongoing.startedAt), ongoing, meet(6, ongoing.startedAt, { status: 'cancelled' }),
    meet(7, ongoing.startedAt, { deletedAt: '2026-10-10' })];
  expect(nextProjectMeet(rows, now)).toBe(ongoing);
  expect(nextProjectMeet(rows, new Date('2026-10-13T00:00:00Z'))).toBeUndefined();
  expect(rows.map(row => row.id)).toEqual([1, 2, 5, 3, 6, 7]);
});
it('uses the Moscow calendar day at the UTC midnight boundary', () => {
  expect(moscowMeetStatus(meet(1, '2026-10-12T00:30:00Z'), new Date('2026-10-11T22:00:00Z'))).toBe('today');
  expect(moscowMeetStatus(meet(1, '2026-10-12T13:00:00Z'), new Date('2026-10-11T20:00:00Z'))).toBe('tomorrow');
  expect(moscowMeetStatus(meet(1, '2026-10-14T13:00:00Z'), new Date('2026-10-11T20:00:00Z'))).toBeNull();
});

it('public lists exclude pending, cancelled, deleted, past and ongoing meetings without mutating input', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-12T13:30:00Z'));
  const now = new Date('2026-10-12T13:30:00Z');
  const rows = [meet(8, '2026-10-12T15:00:00Z'), meet(7, '2026-10-12T14:00:00Z'),
    meet(1, '2026-10-12T13:00:00Z'), meet(2, '2026-10-12T14:00:00Z', { status: 'pending' }),
    meet(3, '2026-10-12T14:00:00Z', { status: 'cancelled' }), meet(4, '2026-10-12T14:00:00Z', { deletedAt: '2026-10-11' }),
    meet(6, '2026-10-12T14:00:00Z')];
  expect(upcomingPublishedMeets(rows, now).map(row => row.id)).toEqual([6, 7, 8]);
  expect(rows.map(row => row.id)).toEqual([8, 7, 1, 2, 3, 4, 6]);
  expect(formatMoscowMeet(meet(1, '2026-10-12T22:00:00Z'))).toContain('13 октября');
  expect(formatMoscowMeet(meet(1, '2026-10-12T22:00:00Z'))).not.toContain('2026');
  expect(formatMoscowMeet(meet(1, '2026-10-12T22:00:00Z'))).toContain('01:00');
  expect(formatMoscowMeet(meet(1, '2026-10-12T22:00:00Z'))).not.toContain('МСК');
});
