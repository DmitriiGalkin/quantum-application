import type { MeetFullDto } from '@shared/types';

export function groupMeets(meets: MeetFullDto[]) {
  const groups: Record<string, MeetFullDto[]> = {};

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  for (const meet of meets) {
    const date = new Date(meet.startedAt);

    let key = formatter.format(date);

    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) key = 'Сегодня';
    if (isTomorrow) key = 'Завтра';

    if (!groups[key]) groups[key] = [];
    groups[key].push(meet);
  }

  return groups;
}
