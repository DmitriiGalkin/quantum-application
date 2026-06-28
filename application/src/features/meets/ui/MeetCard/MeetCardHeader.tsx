import { Box, Chip, Stack, Typography } from '@mui/material';
import type { MeetExtendedDto } from '@shared/types';

interface Props {
  dto: MeetExtendedDto;
}

const statusConfig = {
  today: { label: 'Сегодня', color: 'success' as const },
  upcoming: { label: 'Скоро', color: 'info' as const },
  completed: { label: 'Завершена', color: 'default' as const },
  cancelled: { label: 'Отменена', color: 'error' as const },
};

export default function MeetCardHeader({ dto }: Props) {
  const status = statusConfig['upcoming'];
  const startedAt = new Date(dto.startedAt);
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
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
          {dto.place?.title ?? 'Untitled meeting'}
        </Typography>
      </Box>
    </Stack>
  );
}
