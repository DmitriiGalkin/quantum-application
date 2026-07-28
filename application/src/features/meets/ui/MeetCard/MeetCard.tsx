import type { MeetExtendedDto, MeetStatus } from '@shared/types';
import { useAuth } from '../../../../providers/AuthProvider.tsx';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import MenuButton from '../../../../components/MenuButton';

import MeetCardBody from './MeetCardBody.tsx';
import PlaceFooter from './PlaceFooter';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchCreateMeetUser,
  fetchCreatePayment,
  fetchDeleteMeet,
  fetchDeleteMeetUser, fetchPlace, fetchUpdateMeet, fetchUpdateMeetStatus,
} from '../../../../requests.ts';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { getMeetStatus, statusConfig } from './helper.ts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MeetForm, { type MeetFormValues } from '../MeetForm.tsx';

interface Props {
  meet: MeetExtendedDto;
  refetch?: () => void;
  withoutPaper?: boolean;
}

export default function MeetCard({ meet, refetch, withoutPaper }: Props) {
  const { activeUser, authHandler, passport, activeContext } = useAuth();
  const role = activeContext.role;
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<MeetFormValues>({
    projectId: meet.projectId,
    date: new Date(meet.startedAt).toISOString().slice(0, 10), // YYYY-MM-DD
    time: new Date(meet.startedAt).toTimeString().slice(0, 5), // HH:mm
    duration: meet.duration || 0,
    price: meet.price || 0,
  });

  const { data: place } = useQuery({
    queryKey: ['place', meet.place.id],
    queryFn: () => fetchPlace(meet.place.id || 0),
    enabled: Boolean(meet.place.id),
  });

  const updateMeet = useMutation({
    mutationFn: (form: MeetFormValues) => {
      const { date, time, ...data } = form;
      return fetchUpdateMeet(meet.id, { ...data, startedAt: `${form.date}T${form.time}:00` });
    },

    onSuccess: () => {
      setEditModalOpen(false);
      refetch?.();
    },
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

  const startedAt = new Date(meet.startedAt);
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const body = <MeetCardBody meet={meet} isMember={isMember} />;

  // Только тело встречи
  if (withoutPaper) return body;

  const status = statusConfig[getMeetStatus(meet)];
  const open = Boolean(anchorEl);

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
      onClick: () => setEditModalOpen(true),
    });
    menuItems.push({
      key: 'delete',
      label: 'Удалить встречу',
      icon: <DeleteIcon fontSize="small" />,
      onClick: onDelete,
    });
  }

  if(!place) return null

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
        {/* TOP ROW: status + time */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip label={status.label} color={status.color} size="small" />

          <Typography variant="body2" color="text.secondary">
            {date} • {time}
          </Typography>

              <MenuButton menuItems={menuItems} />
        </Stack>
        {body}
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

      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Редактирование проекта</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <MeetForm
            values={form}
            onChange={setForm}
            schedule={place.schedule}
            onSubmit={() => updateMeet.mutate(form)}
            loading={updateMeet.isPending}
            submitLabel="Сохранить"
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
