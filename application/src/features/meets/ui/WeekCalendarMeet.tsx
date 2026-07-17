// components/meet/WeekCalendarMeet.tsx

import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

import type { MeetExtendedDto } from '@shared/types';

interface Props {
  meet: MeetExtendedDto;

  top: number;

  height: number;

  onClick?(): void;
}

export default function WeekCalendarMeet({ meet, top, height, onClick }: Props) {
  const started = new Date(meet.startedAt);

  return (
    <Box
      onClick={event => {
        event.stopPropagation();
        onClick?.();
      }}
      sx={{
        position: 'absolute',
        top,
        left: 4,
        right: 4,
        height,
        minHeight: 24,
        borderRadius: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        p: 0.75,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 2,
        transition: '.15s',

        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 4,
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {format(started, 'HH:mm')} – {'HH:mm'}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: height < 60 ? 1 : 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        Приятная встреча
      </Typography>

      {height > 70 && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            opacity: 0.9,
            mt: 0.5,
          }}
        >
          Название
        </Typography>
      )}
    </Box>
  );
}
