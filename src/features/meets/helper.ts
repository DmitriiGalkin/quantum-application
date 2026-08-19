import type { MeetDto } from 'types';

export const statusConfig = {
  today: { label: 'Сегодня', color: 'success' as const },
  upcoming: { label: 'Скоро', color: 'info' as const },
  completed: { label: 'Завершена', color: 'default' as const },
  cancelled: { label: 'Отменена', color: 'error' as const },
};

export const getMeetStatus = (meet: MeetDto): keyof typeof statusConfig => {
  if (meet.deletedAt) {
    return 'cancelled';
  }

  const now = new Date();
  const startedAt = new Date(meet.startedAt);

  if (startedAt.toDateString() === now.toDateString()) {
    return 'today';
  }

  if (startedAt > now) {
    return 'upcoming';
  }

  return 'completed';
};