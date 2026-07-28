// components/meet/WeekCalendarMeet.tsx

import { Box, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import type { MeetExtendedDto, MeetStatus } from '@shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpdateMeetStatus } from '../../requests.ts';

interface Props {
  meet: MeetExtendedDto;

  top: number;

  height: number;

  onClick?(): void;
}

export default function WeekCalendarMeet({ meet, top, height, onClick }: Props) {
  const started = new Date(meet.startedAt);
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (status: MeetStatus) => fetchUpdateMeetStatus(meet.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meets', meet.place.id],
      });
    },
  });

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
        bgcolor: meet.status === 'published' ? 'primary.main' : 'pink',
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
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {format(started, 'HH:mm')} – {'HH:mm'}
        </Typography>{' '}
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <CheckIcon color="success" fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => updateStatus.mutate('published')} />
          <CloseIcon color="error" fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => updateStatus.mutate('cancelled')} />
        </Stack>{' '}
      </Stack>

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
        <>
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
        </>
      )}
    </Box>
  );
}
