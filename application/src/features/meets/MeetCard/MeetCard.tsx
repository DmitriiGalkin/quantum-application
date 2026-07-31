import type { MeetExtendedDto, MeetStatus } from '@shared/types';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import MenuButton from '../../../components/MenuButton.tsx';
import PlaceFooter from './PlaceFooter.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchCreateMeetUser,
  fetchCreatePayment,
  fetchDeleteMeet,
  fetchDeleteMeetUser,
  fetchPlace,
  fetchUpdateMeetStatus,
} from '../../../requests.ts';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { getMeetStatus, statusConfig } from './helper.ts';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyRubleIcon from '@mui/icons-material/CurrencyRuble';
import PersonIcon from '@mui/icons-material/Person';
import { EditMeetDialog } from '../EditMeetDialog.tsx';

interface Props {
  meet: MeetExtendedDto;
  refetch?: () => void;
}

export default function MeetCard({ meet, refetch }: Props) {
  const { activeUser, authHandler, passport, activeContext } = useAuth();
  const role = activeContext.role;
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: place } = useQuery({
    queryKey: ['place', meet.place.id],
    queryFn: () => fetchPlace(meet.place.id || 0),
    enabled: Boolean(meet.place.id),
  });

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationDeleteMeet = useMutation({
    mutationFn: fetchDeleteMeet,
    onSuccess: () => {
      refetch?.();
    },
  });

  const createPayment = useMutation({
    mutationFn: fetchCreatePayment,
    onSuccess: payment => {
      console.log('payment', payment);
      window.location.href = payment.paymentUrl;
      return;
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: MeetStatus) => fetchUpdateMeetStatus(meet.id, { status }),
    onSuccess: () => {
      refetch?.();
    },
  });

  const onPay = () => {
    if (activeUser && meet.price && meet.price > 0) {
      return createPayment.mutate({
        targetType: 'meet',
        targetId: meet.id,
        userId: activeUser.id,
      });
    } else {
      console.log('Ты как сюда попал');
    }
  };

  const onJoin = async () => {
    if (!activeUser) {
      authHandler();
      return;
    }

    mutationLike.mutate({
      meetId: meet.id,
      userId: activeUser.id,
    });
  };

  const onEdit = () => console.log('edit meet');

  const onExit = () => {
    if (activeUser) mutationUnlike.mutate({ userId: activeUser.id, meetId: meet.id });
    else authHandler();
  };

  const onDelete = async () => {
    mutationDeleteMeet.mutate(meet.id);
  };

  const paymentStatus = meet.isPaid ? 'paid' : meet.price && meet.price > 0 ? 'pending' : undefined;
  const meetUserStatus = activeUser?.id && meet.users.map(u => u.id).includes(activeUser.id) ? 'member' : 'not_member';
  const isMember = meetUserStatus === 'member';
  const isPending = paymentStatus === 'pending';

  const name = meet.passport?.title ?? 'Unknown';
  const duration = meet.duration != null ? `${meet.duration} min` : '—';

  const isPaid = paymentStatus === 'paid';

  const startedAt = new Date(meet.startedAt);
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const status = statusConfig[getMeetStatus(meet)];

  const menuItems = [];

  if (meet.isPaid && role === 'user') {
    menuItems.push({
      key: 'refund',
      label: 'Запросить возврат средств',
      icon: <PaymentIcon fontSize="small" />,
      onClick: () => {
        console.log('Прошу возврат');
      },
    });
  }

  if (isMember && role === 'user') {
    menuItems.push({
      key: 'leave',
      sx: { color: 'error.main' },
      label: 'Отменить участие',
      icon: <PersonRemoveIcon fontSize="small" />,
      onClick: onExit,
    });
  }

  if (role === 'teacher' && passport?.id === meet.passport.id) {
    menuItems.push({
      key: 'edit',
      label: 'Изменить',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setIsEditOpen(true),
    });
    menuItems.push({
      key: 'delete',
      label: 'Удалить встречу',
      icon: <DeleteIcon fontSize="small" />,
      onClick: onDelete,
    });
  }

  if (!place) return null;

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
        opacity: Boolean(meet.deletedAt) ? 0.5 : 1,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip label={status.label} color={status.color} size="small" />

          <Typography variant="body2" color="text.secondary">
            {date} • {time}
          </Typography>

          <MenuButton menuItems={menuItems} />

          <EditMeetDialog
            meet={meet}
            schedule={place.schedule}
            open={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              refetch?.();
            }}
          />
        </Stack>

        <Stack spacing={1}>
          {/* title */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.2,
                fontWeight: 700,
              }}
            >
              {meet.projectTitle ?? 'Untitled meeting'}
            </Typography>
          </Box>

          {/* location */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LocationOnOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="body2">{meet.place?.address ?? 'Unknown location'}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={1.5}>
          <Stack spacing={1}>
            {/* Преподаватель */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PersonIcon fontSize="small" color="disabled" />
              <Typography variant="body2">{name}</Typography>
            </Stack>

            {/* duration */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ScheduleOutlinedIcon fontSize="small" color="disabled" />
              <Typography variant="body2">{duration}</Typography>
            </Stack>

            {/* participants (aggregated) */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PeopleIcon fontSize="small" color="disabled" />

              <Typography variant="body2">
                {meet.users?.length ?? 0}/{meet.capacity} участников проекта
              </Typography>
            </Stack>

            {meet.price ? (
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CurrencyRubleIcon fontSize="small" color="disabled" />

                  <Typography variant="body2">{meet.price}</Typography>
                </Stack>

                {isMember && activeContext.role === 'user' && !isPaid && <Chip size="small" label="Ожидает оплату" color="warning" />}
                {activeContext.role === 'user' && isPaid && <Chip size="small" label="Оплачено" color="success" />}
              </Stack>
            ) : (
              <Typography variant="body2">Бесплатная встреча</Typography>
            )}
          </Stack>
        </Stack>

        {role === 'user' && (
          <>
            {!isMember && (
              <Button variant="contained" fullWidth onClick={onJoin}>
                Присоединиться
              </Button>
            )}
            {isMember && meet.price && isPending && (
              <Button variant="contained" fullWidth onClick={onPay}>
                Оплатить
              </Button>
            )}
          </>
        )}
        {role === 'place' && meet.status === 'published' && (
          <Typography variant="body2" color="text.secondary">
            Опубликовано
          </Typography>
        )}
        {role === 'place' && meet.status === 'cancelled' && (
          <Typography variant="body2" color="text.secondary">
            Отклонено
          </Typography>
        )}
        {role === 'place' && <PlaceFooter meet={meet} onEdit={onEdit} />}

        {role === 'place' && meet.status === 'pending' && (
          <Stack direction="row" spacing={1}>
            <Button color="success" variant="contained" onClick={() => updateStatus.mutate('published')}>
              Опубликовать
            </Button>

            <Button color="error" variant="outlined" onClick={() => updateStatus.mutate('cancelled')}>
              Отменить
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
