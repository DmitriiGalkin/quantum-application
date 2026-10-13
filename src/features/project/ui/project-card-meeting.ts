import type { MeetDto } from '../../../entities/meet.ts';

export function upcomingPublishedMeets(meets: MeetDto[], now = new Date()): MeetDto[] {
  return meets.filter(meet => !meet.deletedAt && meet.status === 'published'
    && new Date(meet.startedAt).getTime() > now.getTime())
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id);
}

export function formatMoscowMeet(meet: MeetDto): string {
  return `${new Date(meet.startedAt).toLocaleString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  })} МСК`;
}

export function nextProjectMeet(meets: MeetDto[], now = new Date()): MeetDto | undefined {
  return meets.filter(meet => !meet.deletedAt && meet.status !== 'cancelled'
    && new Date(meet.startedAt).getTime() + (meet.duration ?? 60) * 60000 > now.getTime())
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id)[0];
}

export function moscowMeetStatus(meet: MeetDto, now = new Date()): 'today' | 'upcoming' {
  const day = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' });
  return day(new Date(meet.startedAt)) === day(now) ? 'today' : 'upcoming';
}
