import type { MeetDto } from 'entities';
import { moscowDay } from './moscow-time.ts';

export const statusConfig = {
  today: { label: 'Сегодня', color: 'success' as const },
  upcoming: { label: 'Скоро', color: 'info' as const },
  completed: { label: 'Завершена', color: 'default' as const },
  cancelled: { label: 'Отменена', color: 'error' as const },
  rejected: { label: 'Отклонена', color: 'error' as const },
  pending: { label: 'Ожидает подтверждения центра', color: 'warning' as const },
};

export const getMeetStatus = (meet: MeetDto): keyof typeof statusConfig => {
  if (meet.deletedAt) {
    return 'cancelled';
  }
  if (meet.status === 'pending') return 'pending';
  if (meet.status === 'cancelled') return 'rejected';

  const now = new Date();
  const startedAt = new Date(meet.startedAt);

  if (moscowDay(startedAt) === moscowDay(now)) {
    return 'today';
  }

  if (startedAt > now) {
    return 'upcoming';
  }

  return 'completed';
};
