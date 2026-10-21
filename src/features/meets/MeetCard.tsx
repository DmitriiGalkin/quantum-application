import { getBrowser } from '../../shared/lib/browser.ts';
import type { MeetDto } from 'entities';
import { useAuth } from '../../providers/auth-context.ts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuButton from '../../components/MenuButton.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { invalidateMeetQueries } from './hooks/queries.ts';
import {
  fetchCreateMeetUser,
  fetchCreatePayment,
  fetchDeleteMeetUser,
  fetchUpdateMeetStatus,
} from '../../requests.ts';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { canBookMeet, getMeetStatus, statusConfig } from './helper.ts';

import CurrencyRubleIcon from '@mui/icons-material/CurrencyRuble';
import CheckIcon from '@mui/icons-material/Check';
import { EditMeetDialog } from './EditMeetDialog.tsx';
import { canManageMeet, type MeetManagement } from './management.ts';
import { meetingDate, moscowFormat } from './moscow-time.ts';
import { Link } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
import SelectMeetChildDialog from './SelectMeetChildDialog.tsx';
import CardTeacherLine from '../../components/CardTeacherLine.tsx';
import CardVenueLine from '../../components/CardVenueLine.tsx';
import TextField from '@mui/material/TextField';
import { fetchCancelBooking, fetchMeetChange, fetchMeetChangeResponse } from '../../requests.ts';
import { formatMoney } from '../../utils/time.ts';

interface Props {
  meet: MeetDto;
  refetch?: () => void;
  management?: MeetManagement;
}

export default function MeetCard({ meet, refetch, management }: Props) {
  const queryClient = useQueryClient();
  const refreshMeets = async () => {
    await invalidateMeetQueries(queryClient, meet.projectId);
    refetch?.();
  };
  const { authHandler, passport, role, userId } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectChild, setSelectChild] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [refundInfo, setRefundInfo] = useState(false);
  const [cancelMode,setCancelMode] = useState<'booking' | 'meet' | null>(null);
  const [cancelReason,setCancelReason] = useState('');
  const change = useQuery({ queryKey:['meet-change',meet.id,userId,meet.bookingRevision],queryFn:() => fetchMeetChange(meet.id,userId!),
    enabled:role === 'user' && !!userId && !!meet.bookingRevision && meet.status === 'published',retry:false });
  const response = useMutation({ mutationFn:(accepted: boolean) => fetchMeetChangeResponse(meet.id,userId!,change.data!.revision,accepted),
    onSuccess:async () => { await queryClient.invalidateQueries({ queryKey:['meet-change',meet.id] }); await refreshMeets(); } });
  const cancelBooking = useMutation({ mutationFn:() => fetchCancelBooking(meet.id,cancelReason,cancelMode === 'meet'),
    onSuccess:async () => { setCancelMode(null); setCancelReason(''); await refreshMeets(); } });

  const canEdit = role === 'teacher' && passport?.id === meet.passport.id;
  const canCancelBooking = canManageMeet(meet, management) || canEdit;
  const canApprove = role === 'place' && management?.placeId === meet.place.id;

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: refreshMeets,
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: async () => { setConfirmLeave(false); await refreshMeets(); },
  });


  const createPayment = useMutation({
    mutationFn: fetchCreatePayment,
    onSuccess: payment => {
      getBrowser()!.location.href = payment.paymentUrl;
      return;
    },
  });

  const confirmVenue = useMutation({
    mutationFn: () => fetchUpdateMeetStatus(meet.id, { status: 'published' }),
    onSuccess: refreshMeets,
  });

  const onPay = () => {
    if (userId && meet.price && meet.price > 0) {
      return createPayment.mutate({
        targetType: 'meet',
        targetId: meet.id,
        userId,
      });
    }
  };

  const onJoin = async () => {
    if (!userId) {
      authHandler(`/project/${meet.projectId}#meet-${meet.id}`);
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


  const paymentStatus = meet.isPaid ? 'paid' : meet.price && meet.price > 0 ? 'pending' : undefined;
  const meetUserStatus = userId && (meet.users || []).map(u => u.id).includes(userId) ? 'member' : 'not_member';
  const isMember = meetUserStatus === 'member';
  const isPending = paymentStatus === 'pending';

  const name = meet.passport?.title || 'Преподаватель не указан';

  const isPaid = paymentStatus === 'paid';

  const startedAt = new Date(meet.startedAt);
  const canBook = canBookMeet(meet);
  const date = meetingDate(startedAt, {
    day: '2-digit',
    month: 'short',
  });

  const time = moscowFormat(startedAt, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTime = moscowFormat(startedAt.getTime() + (meet.duration ?? 60) * 60000, { hour: '2-digit', minute: '2-digit' });
  const count = meet.participantCount ?? meet.users?.length ?? 0;
  const limit = meet.maxParticipants;
  const full = limit != null && count >= limit;
  const occupancy = limit != null ? Math.min(100, Math.round(count / limit * 100)) : null;
  const free = limit != null ? Math.max(0, limit - count) : null;
  const placesLabel = free !== null && free % 10 === 1 && free % 100 !== 11 ? 'место' : free !== null && free % 10 >= 2 && free % 10 <= 4 && (free % 100 < 12 || free % 100 > 14) ? 'места' : 'мест';
  const actionError = confirmVenue.error || mutationLike.error || mutationUnlike.error || createPayment.error;

  const meetStatus = getMeetStatus(meet);
  const unavailableLabel = meetStatus === 'completed' ? 'Запись завершена' : 'Запись недоступна';
  const statusKey = canApprove && meet.status === 'published' && meetStatus !== 'completed' && meetStatus !== 'cancelled' ? 'confirmed' : meetStatus;
  const status = statusKey ? statusConfig[statusKey] : null;
  const pendingRequest = canApprove && meet.status === 'pending' && meet.bookingState === 'requested';

  const menuItems = [];

  if (meet.isPaid && role === 'user') {
    menuItems.push({
      key: 'refund',
      label: 'Запросить возврат средств',
      icon: <PaymentIcon fontSize="small" />,
      onClick: () => setRefundInfo(true),
    });
  }

  if (isMember && role === 'user') {
    menuItems.push({
      key: 'leave',
      sx: { color: 'error.main' },
      label: 'Отменить участие',
      icon: <PersonRemoveIcon fontSize="small" />,
      onClick: () => setConfirmLeave(true),
    });
  }

  if (canCancelBooking) {
    if (meet.status !== 'cancelled' && meet.bookingState !== 'needs_location') menuItems.push({
      key:'cancel-booking',label:'Отменить бронирование',icon:<DeleteIcon fontSize="small" />,onClick:() => setCancelMode('booking'),
    });
  }
  if (canEdit) {
    menuItems.push({
      key: 'edit',
      label: 'Изменить',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setIsEditOpen(true),
    });
  }
  if (role === 'teacher' && passport?.id === meet.passport.id) {
    menuItems.push({
      key: 'delete',
      label: 'Отменить встречу',
      icon: <DeleteIcon fontSize="small" />,
      onClick: () => setCancelMode('meet'),
    });
  }

  return (
    <Paper
      id={`meet-${meet.id}`}
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
        opacity: meet.deletedAt ? 0.5 : 1,
        minWidth: 0, overflowWrap: 'anywhere', scrollMarginTop: 120,
      }}
    >
      <Stack spacing={2}>
        {change.data?.response === 'pending' && <Alert severity="info">
          Условия встречи изменились. Подтвердите участие на новой площадке.
          <Stack direction="row" sx={{ gap:1,flexWrap:'wrap',mt:1 }}><Button disabled={response.isPending} onClick={() => response.mutate(true)}>Участвуем</Button><Button color="error" disabled={response.isPending} onClick={() => response.mutate(false)}>Отказаться с возвратом оплаты</Button></Stack>
          {response.error?.message}
        </Alert>}
        {(meet.bookingState === 'needs_location' || meet.bookingState === 'awaiting_teacher') && meet.status !== 'cancelled' && <Alert severity="warning">Выберите зал и повторно отправьте заявку. Записи учеников сохранены; новая запись и оплата закрыты.</Alert>}
        {meet.status === 'pending' && meet.bookingState === 'requested' && (meet.venuePrice == null || meet.venueHourlyRate == null)
          && (canApprove || canEdit) && <Alert severity="warning">Стоимость аренды не указана. Преподавателю нужно обновить заявку после установки ставки зала.</Alert>}
        {(canApprove || canEdit) && meet.venuePrice != null && <Typography variant="body2" color="text.secondary">
          Аренда для преподавателя: {meet.venueHourlyRate == null ? '' : `${formatMoney(meet.venueHourlyRate)} / час · `}{formatMoney(meet.venuePrice)} за встречу
        </Typography>}
        {cancelMode && <Dialog open onClose={cancelBooking.isPending ? undefined : () => setCancelMode(null)} fullWidth maxWidth="sm">
          <ClosableDialogTitle onClose={() => setCancelMode(null)} disabled={cancelBooking.isPending}>{cancelMode === 'meet' ? 'Отменить встречу?' : 'Отменить бронирование?'}</ClosableDialogTitle>
          <DialogContent><Stack spacing={2} sx={{ pt:1 }}>
            <Typography>{cancelMode === 'meet' ? 'Участники получат уведомление об отмене. Оплаченные места будут поставлены в очередь возврата.' : 'Зал освободится. Записи учеников и оплаты сохранятся, новая запись закроется до подтверждения другой площадки.'}</Typography>
            <TextField required label="Причина" multiline value={cancelReason} onChange={e => setCancelReason(e.target.value)} slotProps={{ htmlInput:{ maxLength:2000 } }} />
            {cancelBooking.error && <Alert severity="error">{cancelBooking.error.message}</Alert>}
          </Stack></DialogContent>
          <DialogActions><Button disabled={cancelBooking.isPending} onClick={() => setCancelMode(null)}>Назад</Button><Button color="error" disabled={cancelBooking.isPending || !cancelReason.trim()} onClick={() => cancelBooking.mutate()}>Подтвердить отмену</Button></DialogActions>
        </Dialog>}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
            {date} • {time}–{endTime}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0 }}>
            {status && <Chip icon={statusKey === 'confirmed' ? <CheckIcon /> : undefined} label={status.label} title={status.label}
              color={status.color} size="small" sx={{ maxWidth: { xs: 120, sm: 'none' } }} />}
            <MenuButton menuItems={menuItems} />
          </Stack>

          {isEditOpen && <EditMeetDialog
            meet={meet}
            open={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              refetch?.();
            }}
          />}
        </Stack>

        <Stack direction="row" spacing={2}>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            {/* title */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  lineHeight: 1.2,
                  fontWeight: 700,
                }}
              >
                {meet.projectTitle || 'Название проекта не указано'}
              </Typography>
            </Box>

          </Stack>

          {meet.projectImage && <Box
            component="img"
            src={meet.projectImage}
            alt={meet.projectTitle || 'Проект'}
            sx={{
              height: 56, width: 72, flexShrink: 0,
              objectFit: 'cover',
              borderRadius: 2,
              display: 'block',
            }}
          />}
        </Stack>
        {!pendingRequest && limit != null && (
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {full ? 'Мест нет' : `Свободно ${free} ${placesLabel}`}
              </Typography>
              {occupancy !== null && <Chip size="small" label={`${occupancy}%`} color={full ? 'warning' : 'default'} />}
            </Stack>
            {occupancy !== null && <LinearProgress variant="determinate" value={occupancy} aria-label="Заполненность встречи" />}
          </Stack>
        )}
        <Stack spacing={1.5}>
          <Stack spacing={1}>
            <CardTeacherLine id={meet.passport.id} title={name} image={meet.passport.image} />
            <CardVenueLine id={meet.place.id} title={meet.place.title || 'Центр не указан'}
              address={meet.place.address} room={meet.location?.title || 'Зал не выбран'} />

            {meet.price ? (
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CurrencyRubleIcon fontSize="small" color="disabled" />

                  <Typography variant="body2">{meet.price} ₽</Typography>
                </Stack>

                {isMember && role === 'user' && !isPaid && <Chip size="small" label="Ожидает оплату" color="warning" />}
                {role === 'user' && isPaid && <Chip size="small" label="Оплачено" color="success" />}
              </Stack>
            ) : (
              <Typography variant="body2">{meet.price == null ? 'Стоимость не указана' : 'Бесплатная встреча · 0 ₽'}</Typography>
            )}
          </Stack>
        </Stack>

        {role === 'user' && (
          <>
            <Typography variant="body2">Участник: {passport?.users?.find(user => user.id === userId)?.title || 'выбранный ребёнок'}</Typography>
            {!isMember && (
              <Button variant="contained" fullWidth disabled={full || !canBook || mutationLike.isPending} onClick={onJoin}>
                {canBook ? 'Присоединиться' : unavailableLabel}
              </Button>
            )}
            {isMember && meet.price && isPending && (
              <Button variant="contained" fullWidth disabled={createPayment.isPending || meet.status !== 'published' || meet.bookingState === 'needs_location'} onClick={onPay}>
                {createPayment.isPending ? 'Переход к оплате…' : 'Оплатить'}
              </Button>
            )}
          </>
        )}
        {role !== 'user' && !canEdit && !canApprove && <Button variant="contained"
          disabled={full || !canBook}
          onClick={() => passport ? setSelectChild(true) : authHandler(`/project/${meet.projectId}#meet-${meet.id}`)}>
          {canBook ? (passport ? 'Выбрать ребёнка для записи' : 'Войти и записать ребёнка') : unavailableLabel}
        </Button>}
        {selectChild && <SelectMeetChildDialog open onClose={() => setSelectChild(false)} />}
        {refundInfo && <Dialog open onClose={() => setRefundInfo(false)} fullWidth maxWidth="sm">
          <ClosableDialogTitle onClose={() => setRefundInfo(false)}>Возврат оплаты</ClosableDialogTitle>
          <DialogContent><Stack spacing={2}>
            <Typography>Для обсуждения возврата свяжитесь с преподавателем или центром. Запрос на возврат автоматически не отправляется.</Typography>
            <Button component={Link} to={`/teachers/${meet.passport.id}`}>Связаться с преподавателем</Button>
            <Button component={Link} to={`/places/${meet.place.id}`}>Контакты центра</Button>
          </Stack></DialogContent>
        </Dialog>}
        {confirmLeave && <Dialog open onClose={mutationUnlike.isPending ? undefined : () => setConfirmLeave(false)} fullWidth maxWidth="sm">
          <ClosableDialogTitle onClose={() => setConfirmLeave(false)} disabled={mutationUnlike.isPending}>Отменить участие?</ClosableDialogTitle>
          <DialogContent>
            <Typography>{meet.projectTitle} · {date}, {time}</Typography>
            {isPaid && <Typography sx={{ mt: 2 }}>Отмена участия не оформляет возврат оплаты. Для возврата свяжитесь с организатором.</Typography>}
            {mutationUnlike.isError && <Alert severity="error">{mutationUnlike.error.message}</Alert>}
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button disabled={mutationUnlike.isPending} onClick={() => setConfirmLeave(false)}>Оставить участие</Button>
            <Button color="error" disabled={mutationUnlike.isPending} onClick={onExit}>Отменить участие</Button>
          </DialogActions>
        </Dialog>}
        {actionError && <Alert severity="error">{actionError.message}</Alert>}
        {pendingRequest && (
          <Stack spacing={1}>
            <Button color="success" variant="contained" disabled={confirmVenue.isPending || meet.venuePrice == null} onClick={() => confirmVenue.mutate()}>
              Подтвердить зал
            </Button>
            <Button color="error" variant="outlined" disabled={confirmVenue.isPending} onClick={() => setCancelMode('booking')}>
              Отклонить
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
