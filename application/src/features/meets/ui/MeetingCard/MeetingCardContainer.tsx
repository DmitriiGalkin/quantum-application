import type { Meeting } from './MeetingCard.types';
import type { MeetExtendedDto, UserDto } from '@shared/types';
import type { ActiveRole } from '../../../../providers/AuthProvider.tsx';
import { Paper, Stack } from '@mui/material';

import MeetingCardHeader from './MeetingCardHeader';
import MeetingCardBody from './MeetingCardBody';
import StudentFooter from './StudentFooter';
import TeacherFooter from './TeacherFooter';
import GuestFooter from './GuestFooter';
import PlaceFooter from './PlaceFooter';

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

export function toMeeting(dto: MeetExtendedDto, user: UserDto | null): Meeting {
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
    teacherName: dto.passport?.title ?? 'Unknown',
    teacherAvatar: dto.passport?.image ?? undefined,
    date,
    time,
    duration,
    location: dto.place?.address ?? 'Unknown location',

    // ⚠️ важно: статус тут НЕ вычисляем "умно"
    // оставляем плоскую мапу или дефолт
    status: 'upcoming',
    meetUserStatus: user?.id && dto.users.map(u=>u.id).includes(user.id) ? 'member' : 'not_member',
    enrolled: dto.users?.length ?? 0,
    capacity: 30,
    paymentStatus: dto.isPaid ? 'paid' : dto.price != null ? 'pending' : undefined,
  };
}

export default function MeetingCardContainer({
  meeting,
  role = 'guest',
  onPay,
  onJoin,
  onEdit,
  //onReschedule,
  onCancel,
  onOpen,
}: Props) {
  const id = meeting.id;


  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: '0.2s',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack spacing={2}>
        <MeetingCardHeader meeting={meeting} />

        <MeetingCardBody meeting={meeting} />

        {role === 'guest' && <GuestFooter meeting={meeting} onOpen={() => onOpen?.(id)} />}
        {role === 'user' && <StudentFooter meeting={meeting} onPay={() => onPay?.(id)} onJoin={() => onJoin?.(id)} />}
        {role === 'teacher' && <TeacherFooter onEdit={() => onEdit?.(id)} onCancel={() => onCancel?.(id)} />}
        {role === 'place' && <PlaceFooter meeting={meeting} onEdit={() => onEdit?.(id)} />}
      </Stack>
    </Paper>
  );
}

