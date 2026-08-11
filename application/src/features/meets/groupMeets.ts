import type { MeetExtendedDto } from '@shared/types';

export function groupMeets(meets: MeetExtendedDto[]) {
  const groups: Record<number, MeetExtendedDto[]> = {}; // Используем timestamp как ключ

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  for (const meet of meets) {
    const date = new Date(meet.startedAt);
    date.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня

    let key: number = date.getTime();

    if (date.getTime() === now.getTime()) {
      key = now.getTime(); // Сегодня
    } else if (date.getTime() === tomorrow.getTime()) {
      key = tomorrow.getTime(); // Завтра
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(meet);
  }

  return groups;
}
