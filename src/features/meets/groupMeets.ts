import type { MeetExtendedDto } from 'dto';

export function groupMeets(meets: MeetExtendedDto[]) {
  const groups: Map<number, MeetExtendedDto[]> = new Map; // Используем Date как ключ

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня

  for (const meet of meets) {
    const date = new Date(meet.startedAt);
    date.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня

    let key: number = date.getTime();

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(meet);
  }

  return groups;
}
