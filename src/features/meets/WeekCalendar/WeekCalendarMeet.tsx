// components/meet/WeekCalendarMeet.tsx

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { moscowFormat } from '../moscow-time.ts';
import { useAuth } from '../../../providers/auth-context.ts';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import { getMeetStatus, statusConfig } from '../helper.ts';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { MeetDto, MeetStatus } from 'entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpdateMeetStatus } from '../../../requests.ts';
import { invalidateMeetQueries } from '../hooks/queries.ts';
import type { MeetManagement } from '../management.ts';

interface Props {
  meet: MeetDto;

  top: number;

  height: number;

  onClick?(): void;
  draggable?: boolean;
  saving?: boolean;
  management?: MeetManagement;
  onError?(message: string): void;
}

export default function WeekCalendarMeet({ meet, top, height, onClick, draggable = false, saving, management, onError }: Props) {
  const started = new Date(meet.startedAt);
  const { role } = useAuth();
  const baseStatus = getMeetStatus(meet);
  const statusKey = role === 'place' && management?.placeId === meet.place?.id && meet.status === 'published'
    && baseStatus !== 'completed' && baseStatus !== 'cancelled' ? 'confirmed' : baseStatus;
  const status = statusKey ? statusConfig[statusKey] : null;
  const queryClient = useQueryClient();
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: meet.id,
    data: { meet },
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const updateStatus = useMutation({
    mutationFn: (status: MeetStatus) => fetchUpdateMeetStatus(meet.id, { status }),
    onSuccess: () => invalidateMeetQueries(queryClient, meet.projectId),
    onError: error => onError?.(error.message),
  });

  return (
    <Box
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      role="button"
      tabIndex={0}
      aria-label={`${meet.projectTitle || 'Встреча'}${draggable ? ', перенос: пробел, стрелки, пробел; отмена: Escape' : ', открыть сведения'}`}
      onKeyDown={event => {
        if (draggable) listeners?.onKeyDown?.(event);
        else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick?.(); }
      }}
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
        cursor: draggable ? 'grab' : 'pointer',
        touchAction: draggable ? 'none' : 'auto',
        zIndex: transform ? 2 : 1,
        opacity: saving ? 0.5 : 1,
        boxShadow: 2,
        transition: 'box-shadow .15s',

        '&:hover': {
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
        {role === 'place' && management?.placeId === meet.place?.id && meet.status === 'pending' && <Stack direction="row">
          <IconButton size="small" aria-label="Подтвердить" disabled={updateStatus.isPending} onMouseDown={event => event.stopPropagation()} onTouchStart={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); updateStatus.mutate('published'); }}><CheckIcon color="success" fontSize="small" /></IconButton>
          <IconButton size="small" aria-label="Отклонить" disabled={updateStatus.isPending} onMouseDown={event => event.stopPropagation()} onTouchStart={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); updateStatus.mutate('cancelled'); }}><CloseIcon color="error" fontSize="small" /></IconButton>
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
        {meet.projectTitle || 'Название проекта не указано'}
      </Typography>

      {status && <Chip size="small" label={status.label} color={status.color} icon={statusKey === 'confirmed' ? <CheckIcon /> : undefined} />}
      {saving && <Typography variant="caption">Сохранение…</Typography>}
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
            {meet.place?.title || 'Центр не указан'} · {meet.location?.title || 'Зал не выбран'}
            {!(role === 'place' && meet.status === 'pending' && !(meet.participantCount ?? meet.users?.length)) && <>
              {' · '}Записано {meet.participantCount ?? meet.users?.length ?? 0}{meet.maxParticipants != null ? ` из ${meet.maxParticipants}` : ''}
            </>}
          </Typography>
        </>
      )}
    </Box>
  );
}
