import MeetingCard from './MeetingCard';
import type { Meeting } from './MeetingCard.types';
import type { MeetExtendedDto, PassportDto } from '@shared/types';
import type { ActiveRole } from '../../../../providers/AuthProvider.tsx';

interface Props {
  meeting: Meeting;

  role: ActiveRole | null;

  onPay?: (id: string) => void;
  onJoin?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function toMeeting(dto: MeetExtendedDto, passport?: PassportDto): Meeting {
  const startedAt = new Date(dto.startedAt);

  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const duration = dto.duration != null ? `${dto.duration} min` : '—';

  return {
    id: String(dto.id),

    title: dto.place?.title ?? 'Untitled meeting',

    // MVP assumption: first user = teacher
    teacherName: passport?.title ?? 'Unknown',
    teacherAvatar: passport?.image ?? undefined,

    date,
    time,
    duration,

    location: dto.place?.address ?? 'Unknown location',

    // ⚠️ важно: статус тут НЕ вычисляем "умно"
    // оставляем плоскую мапу или дефолт
    status: 'upcoming',

    enrolled: dto.users?.length ?? 0,

    // MVP fallback (если backend не даёт capacity)
    capacity: 30,

    // derived field
    paymentStatus: dto.isPaid ? 'paid' : dto.price != null ? 'pending' : undefined,
  };
}

export default function MeetingCardContainer({
  meeting,
  role = 'guest',
  onPay,
  onJoin,
  onEdit,
  onReschedule,
  onCancel,
  onOpen,
}: Props) {
  const id = meeting.id;

  // PRIMARY ACTION LOGIC (MVP level)
  const getPrimaryAction = () => {
    switch (role) {
      case 'user':
        if (meeting.paymentStatus === 'pending') {
          return () => onPay?.(id);
        }

        if (meeting.status === 'today') {
          return () => onJoin?.(id);
        }

        return () => onOpen?.(id);

      case 'teacher':
        return () => onEdit?.(id);

      case 'place':
        return () => onOpen?.(id);

      case 'guest':
      default:
        return () => onOpen?.(id);
    }
  };

  // SECONDARY ACTION LOGIC (MVP simplified)
  const getSecondaryAction = () => {
    switch (role) {
      case 'user':
        return () => onOpen?.(id);

      case 'teacher':
        return () => onReschedule?.(id);

      default:
        return undefined;
    }
  };

  return <MeetingCard role={role as ActiveRole} meeting={meeting} onPrimaryAction={getPrimaryAction()} onSecondaryAction={getSecondaryAction()} />;
}
