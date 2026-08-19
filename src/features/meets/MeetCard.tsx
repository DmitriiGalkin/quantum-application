import type { MeetExtendedDto, MeetStatus } from 'types';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import MenuButton from '../../components/MenuButton.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchCreateMeetUser,
  fetchCreatePayment,
  fetchDeleteMeet,
  fetchDeleteMeetUser,
  fetchPlace,
  fetchUpdateMeetStatus,
} from '../../requests.ts';
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
import { EditMeetDialog } from './EditMeetDialog.tsx';

interface Props {
  meet: MeetExtendedDto;
  refetch?: () => void;
}

export default function MeetCard({ meet, refetch }: Props) {
  const { authHandler, passport, role, userId } = useAuth();
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
    if (userId && meet.price && meet.price > 0) {
      return createPayment.mutate({
        targetType: 'meet',
        targetId: meet.id,
        userId,
      });
    } else {
      console.log('Ты как сюда попал');
    }
  };

  const onJoin = async () => {
    if (!userId) {
      authHandler();
      return;
    }

    mutationLike.mutate({
      meetId: meet.id,
      userId,
    });
  };

  const onExit = () => {
    if (userId) mutationUnlike.mutate({ userId, meetId: meet.id });
    else authHandler();
  };

  const onDelete = async () => {
    mutationDeleteMeet.mutate(meet.id);
  };

  const paymentStatus = meet.isPaid ? 'paid' : meet.price && meet.price > 0 ? 'pending' : undefined;
  const meetUserStatus = userId && meet.users.map(u => u.id).includes(userId) ? 'member' : 'not_member';
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

  const occupancy = (meet.users?.length ?? 0) / 30;
  const occupancyTitle = `${meet.users?.length ?? 0}/30`;

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
        p: 2,
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

        <Stack direction="row" spacing={2}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            {/* title */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  lineHeight: 1.2,
                  fontWeight: 700,
                }}
              >
                {meet.projectTitle ?? 'Забота о лошадях'}
              </Typography>
            </Box>

            {/* location */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocationOnOutlinedIcon fontSize="small" color="disabled" />
              <Typography variant="body2">{meet.place?.address ?? 'Unknown location'}</Typography>
            </Stack>
          </Stack>

          <Box
            component="img"
            src="https://storage.yandexcloud.net/quantum-education/b1a3d8d5-52dd-4d8c-b998-a3cc95e9f70b.jpg"
            alt="Описание изображения"
            sx={{
              height: 56,
              objectFit: 'cover',
              borderRadius: 2,
              display: 'block',
            }}
          />
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

                {isMember && role === 'user' && !isPaid && <Chip size="small" label="Ожидает оплату" color="warning" />}
                {role === 'user' && isPaid && <Chip size="small" label="Оплачено" color="success" />}
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
        {role === 'place' && (
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Загруженность
              </Typography>

              <Chip size="small" label={occupancyTitle} color={occupancy > 0.8 ? 'warning' : 'default'} />
            </Stack>
          </Stack>
        )}

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
