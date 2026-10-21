import { expect, it } from 'vitest';
import type { MeetDto } from 'entities';
import { informationDate, informationRange, meetingDate } from './moscow-time.ts';
import { getMeetStatus } from './helper.ts';

it('formats meeting dates without a year across New Year while retaining years for other dated content', () => {
  const now = new Date('2026-12-31T21:00:00Z');
  expect(meetingDate('2026-12-31T21:05:00Z')).toBe('1 января');
  expect(meetingDate('2026-12-31T20:59:00Z')).toBe('31 декабря');
  expect(informationDate('2026-12-31T21:05:00Z', {}, now)).toBe('1 января');
  expect(informationDate('2026-12-31T20:59:00Z', {}, now)).toContain('2026');
  const range = informationRange('2026-12-31T20:59:00Z', '2026-12-31T21:05:00Z');
  expect(range).not.toMatch(/2026|2027/);
});

it('shows today/tomorrow only around Moscow midnight and preserves operational statuses', () => {
  const now = new Date('2026-12-31T20:59:00Z');
  const meet = { startedAt: '2026-12-31T21:01:00Z', status: 'published', duration: 60, deletedAt: null } as MeetDto;
  expect(getMeetStatus(meet, now)).toBe('tomorrow');
  expect(getMeetStatus(meet, new Date('2026-12-31T21:00:00Z'))).toBe('today');
  expect(getMeetStatus({ ...meet, startedAt: '2027-01-02T10:00:00Z' }, now)).toBeNull();
  expect(getMeetStatus({ ...meet, status: 'pending' }, now)).toBe('pending');
  expect(getMeetStatus({ ...meet, status: 'cancelled' }, now)).toBe('cancelled');
  expect(getMeetStatus(meet, new Date('2027-01-01T10:00:00Z'))).toBe('completed');
});
