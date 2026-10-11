// components/meet/WeekCalendarMeet.tsx

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { moscowFormat } from '../moscow-time.ts';
import { useAuth } from '../../../providers/auth-context.ts';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { MeetDto, MeetStatus } from 'entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpdateMeetStatus } from '../../../requests.ts';
import { invalidateMeetQueries } from '../hooks/queries.ts';

interface Props {
  meet: MeetDto;

  top: number;

  height: number;

  onClick?(): void;
}

export default function WeekCalendarMeet({ meet, top, height, onClick }: Props) {
  const started = new Date(meet.startedAt);
  const { role } = useAuth();
  const queryClient = useQueryClient();
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: meet.id,
    data: { meet },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const updateStatus = useMutation({
    mutationFn: (status: MeetStatus) => fetchUpdateMeetStatus(meet.id, { status }),
    onSuccess: () => invalidateMeetQueries(queryClient, meet.projectId),
  });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={event => {
        event.stopPropagation();
        onClick?.();
      }}
      sx={{
        ...style,
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
        cursor: 'grab',
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
          {moscowFormat(started, { hour: '2-digit', minute: '2-digit' })} — {moscowFormat(started.getTime() + (meet.duration ?? 60) * 60000, { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        {role === 'place' && meet.status === 'pending' && <Stack direction="row">
          <IconButton size="small" aria-label="Подтвердить" disabled={updateStatus.isPending} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); updateStatus.mutate('published'); }}><CheckIcon color="success" fontSize="small" /></IconButton>
          <IconButton size="small" aria-label="Отменить" disabled={updateStatus.isPending} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); updateStatus.mutate('cancelled'); }}><CloseIcon color="error" fontSize="small" /></IconButton>
        </Stack>}
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

      {meet.status === 'pending' && <Typography variant="caption">Ожидает подтверждения центра</Typography>}
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
