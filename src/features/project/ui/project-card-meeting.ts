import type { MeetDto } from '../../../entities/meet.ts';
import { DAY_MS, informationDate, moscowDay, moscowFormat } from '../../meets/moscow-time.ts';

export function upcomingPublishedMeets(meets: MeetDto[], now = new Date()): MeetDto[] {
  return meets.filter(meet => !meet.deletedAt && meet.status === 'published'
    && new Date(meet.startedAt).getTime() > now.getTime())
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id);
}

export function formatMoscowMeet(meet: MeetDto): string {
  return `${informationDate(meet.startedAt)}, ${moscowFormat(meet.startedAt, { hour: '2-digit', minute: '2-digit' })} МСК`;
}

export function nextProjectMeet(meets: MeetDto[], now = new Date()): MeetDto | undefined {
  return meets.filter(meet => !meet.deletedAt && meet.status !== 'cancelled'
    && new Date(meet.startedAt).getTime() + (meet.duration ?? 60) * 60000 > now.getTime())
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id)[0];
}

export function moscowMeetStatus(meet: MeetDto, now = new Date()): 'today' | 'tomorrow' | null {
  const day = moscowDay(meet.startedAt);
  if (day === moscowDay(now)) return 'today';
  return day === moscowDay(now) + DAY_MS ? 'tomorrow' : null;
}
