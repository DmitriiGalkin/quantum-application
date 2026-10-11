import { expect, it } from 'vitest';
import type { MeetDto } from '../../../entities/meet.ts';
import { nextProjectMeet, moscowMeetStatus } from './project-card-meeting.ts';

const meet = (id: number, startedAt: string, overrides: Partial<MeetDto> = {}) => ({ id, startedAt, duration: 60, deletedAt: null, status: 'published', ...overrides }) as MeetDto;
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
  expect(moscowMeetStatus(meet(1, '2026-10-12T13:00:00Z'), new Date('2026-10-11T20:00:00Z'))).toBe('upcoming');
});
