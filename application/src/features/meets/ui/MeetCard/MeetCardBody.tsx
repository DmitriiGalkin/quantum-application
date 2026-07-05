import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import type { MeetExtendedDto } from '@shared/types';

const statusConfig = {
  today: { label: 'Сегодня', color: 'success' as const },
  upcoming: { label: 'Скоро', color: 'info' as const },
  completed: { label: 'Завершена', color: 'default' as const },
  cancelled: { label: 'Отменена', color: 'error' as const },
};

interface Props {
  meet: MeetExtendedDto;
}

export default function MeetCardBody({ meet }: Props) {
  const name = meet.passport?.title ?? 'Unknown';
  const duration = meet.duration != null ? `${meet.duration} min` : '—';
  const status = statusConfig['upcoming'];
  const startedAt = new Date(meet.startedAt);
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Stack spacing={1}>
        {/* TOP ROW: status + time */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip label={status.label} color={status.color} size="small" />

          <Typography variant="body2" color="text.secondary">
            {date} • {time}
          </Typography>
        </Stack>

        {/* TITLE */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.2,
              fontWeight: 700,
            }}
          >
            {meet.place?.title ?? 'Untitled meeting'}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={1.5}>
        {/* TEACHER / ORGANIZER */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar src={meet.passport?.image ?? undefined}>{name[0]}</Avatar>

          <Box>
            <Typography sx={{ fontWeight: 600 }}>{name}</Typography>

            <Typography variant="body2" color="text.secondary">
              Teacher
            </Typography>
          </Box>
        </Stack>

        {/* META INFO */}
        <Stack spacing={1}>
          {/* duration */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" />
            <Typography variant="body2">{duration}</Typography>
          </Stack>

          {/* location */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LocationOnOutlinedIcon fontSize="small" />
            <Typography variant="body2">{meet.place?.address ?? 'Unknown location'}</Typography>
          </Stack>

          {/* participants (aggregated) */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" />

            <Typography variant="body2">
              {meet.users?.length ?? 0}/{meet.capacity} участников проекта
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" />

            <Typography variant="body2">{meet.price}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
