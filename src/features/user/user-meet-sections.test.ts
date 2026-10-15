import { expect, it } from 'vitest';
import type { MeetDto } from '../../entities/meet.ts';
import { userMeetSections } from './user-meet-sections.ts';

it('keeps an ongoing meeting ahead of future ones and moves cancelled or deleted meetings to history', () => {
  const row = { status: 'published', duration: 60, deletedAt: null };
  const meets = [
    { ...row, id: 4, startedAt: '2030-01-08T12:00:00Z' },
    { ...row, id: 3, startedAt: '2030-01-07T11:30:00Z' },
    { ...row, id: 2, startedAt: '2030-01-07T10:00:00Z' },
    { ...row, id: 5, startedAt: '2030-01-09T12:00:00Z', status: 'cancelled' },
    { ...row, id: 6, startedAt: '2030-01-10T12:00:00Z', deletedAt: '2030-01-01' },
  ] as MeetDto[];
  const sections = userMeetSections(meets, new Date('2030-01-07T12:00:00Z'));
  expect(sections.upcoming.map(meet => meet.id)).toEqual([3, 4]);
  expect(sections.history.map(meet => meet.id)).toEqual([6, 5, 2]);
  expect(meets.map(meet => meet.id)).toEqual([4, 3, 2, 5, 6]);
});

it('treats a null duration as the existing 60 minute default', () => {
  const meet = { id: 1, startedAt: '2030-01-07T11:30:00Z', status: 'published', duration: null, deletedAt: null } as MeetDto;
  expect(userMeetSections([meet], new Date('2030-01-07T12:00:00Z')).upcoming).toEqual([meet]);
  expect(userMeetSections([meet], new Date('2030-01-07T12:30:00Z')).history).toEqual([meet]);
});
