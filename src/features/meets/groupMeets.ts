import type { MeetDto } from 'entities';
import { moscowDay } from './moscow-time.ts';

export function groupMeets(meets: MeetDto[]) {
  const groups: Map<number, MeetDto[]> = new Map; // Используем Date как ключ

  for (const meet of [...meets].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime() || a.id - b.id)) {
    const key = moscowDay(meet.startedAt);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(meet);
  }

  return groups;
}
