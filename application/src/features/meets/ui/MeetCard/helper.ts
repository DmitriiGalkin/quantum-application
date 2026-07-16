import type { MeetDto } from '@shared/types';

export const onKassa = async (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
  e.preventDefault();

  // Эмуляция webhook от ЮKassa
  await fetch('http://localhost:4000/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: '1234567890',
        status: 'succeeded',
        paid: true,
        amount: {
          value: '100.00',
          currency: 'RUB',
        },
        metadata: {
          meetId: 16,
          userId: 32,
        },
      },
    }),
  });

  // или после успешной эмуляции
  // mutationLike.mutate({ userId: user!.id, meetId: meet.id });
};

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