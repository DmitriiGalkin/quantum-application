import type { MeetDto } from '../../entities/meet.ts';

export function userMeetSections(meets: MeetDto[], now = new Date()) {
  const upcoming: MeetDto[] = [];
  const history: MeetDto[] = [];
  for (const meet of meets) {
    const end = new Date(meet.startedAt).getTime() + (meet.duration ?? 60) * 60000;
    (meet.status !== 'cancelled' && !meet.deletedAt && end > now.getTime() ? upcoming : history).push(meet);
  }
  const byStart = (a: MeetDto, b: MeetDto) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id;
  upcoming.sort(byStart);
  history.sort((a, b) => byStart(b, a));
  return { upcoming, history };
}
