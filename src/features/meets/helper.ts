import type { MeetDto } from 'entities';
import { DAY_MS, moscowDay } from './moscow-time.ts';

export const statusConfig = {
  today: { label: 'Сегодня', color: 'success' as const },
  tomorrow: { label: 'Завтра', color: 'info' as const },
  completed: { label: 'Завершена', color: 'default' as const },
  cancelled: { label: 'Отменена', color: 'error' as const },
  rejected: { label: 'Отклонена', color: 'error' as const },
  pending: { label: 'На подтверждении', color: 'warning' as const },
  confirmed: { label: 'Подтверждена', color: 'success' as const },
};

export const getMeetStatus = (meet: MeetDto, now = new Date()): keyof typeof statusConfig | null => {
  if (meet.deletedAt) {
    return 'cancelled';
  }
  if (meet.status === 'pending') return 'pending';
  if (meet.status === 'cancelled') return 'cancelled';

  const startedAt = new Date(meet.startedAt);
  if (startedAt.getTime() + (meet.duration ?? 60) * 60000 <= now.getTime()) return 'completed';

  if (moscowDay(startedAt) === moscowDay(now)) {
    return 'today';
  }

  if (startedAt > now) {
    return moscowDay(startedAt) === moscowDay(now) + DAY_MS ? 'tomorrow' : null;
  }

  return 'completed';
};
