import type { MeetExtendedDto, PassportDto } from '@shared/types';
import { Button, Card, Chip, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchCreatePayment, fetchDeleteMeetUser } from '../../../requests.ts';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import Box from '@mui/material/Box';
import MeetCardHeader from './MeetCardHeader.tsx';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MailOutlineIcon from '@mui/icons-material/Mail';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  meet: MeetExtendedDto;
  refetch?: () => void;
  passport?: PassportDto;
  withoutAction?: boolean;
  withoutUsers?: boolean;
};

function Meet({ meet, refetch, passport, withoutAction, withoutUsers }: Props) {
  const { user, authHandler } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const liked = user && meet.users?.some(u => u.id === user.id);
  const start = new Date(meet.startedAt);
  const end = meet.duration ? new Date(start.getTime() + meet.duration * 60 * 1000) : null;

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

  const createPayment = useMutation({
    mutationFn: fetchCreatePayment,
    onSuccess: payment => {
      console.log('payment', payment);
      window.location.href = payment.paymentUrl;
      return;
    },
  });

  const handleJoin = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      authHandler();
      return;
    }

    mutationLike.mutate({
      meetId: meet.id,
      userId: user.id,
    });
  };

  const handleKassa = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    // Эмуляция webhook от ЮKassa
    await fetch('http://localhost:4000/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: '1234567890',
          status: 'succeeded',
          paid: true,
          amount: {
            value: '100.00',
            currency: 'RUB',
          },
          metadata: {
            meetId: meet.id,
            userId: user?.id,
          },
        },
      }),
    });

    // или после успешной эмуляции
    // mutationLike.mutate({ userId: user!.id, meetId: meet.id });
  };

  const handlePay = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (meet.price && meet.price > 0) {
      return createPayment.mutate({
        targetType: 'meet',
        targetId: meet.id,
      });
    } else {
      console.log('Ты как сюда попал')
    }
  };

  const handleUnlike = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const paid = meet.isPaid

  return (
    <Card>
      <IconButton onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={e => {
            handleClose(e);
            navigate(`/project/${meet.projectId}/meets/${meet.id}/edit`);
          }}
        >
          <ListItemIcon>
            <MailOutlineIcon fontSize="small" />
          </ListItemIcon>
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={e => {
            handleClose(e);
            console.log('удалить');
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Удалить встречу
        </MenuItem>
      </Menu>
      {passport && <MeetCardHeader passport={passport} handleUnlike={liked && handleUnlike} />}
      <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Ближайшая встреча
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {/* MAIN ROW */}
          <Stack direction="row" spacing={1}>
            {/* DATE BLOCK */}
            <Box
              sx={{
                width: 44,
                height: 56,
                borderRadius: 2,
                backgroundColor: 'rgba(255,182,40,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption">
                {new Date(meet.startedAt).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase()}
              </Typography>

              <Typography variant="h6">{new Date(meet.startedAt).getDate()}</Typography>
            </Box>

            {/* INFO */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2">
                {start.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {end &&
                  ' — ' +
                    end.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </Typography>

              <Typography component="p" sx={{ color: 'text.secondary' }} noWrap gutterBottom>
                {meet.place.address}
              </Typography>

              <Stack direction="row" spacing={1}>
                {meet.price ? (
                  <Chip size="small" label={`${meet.price} ₽`} variant="outlined" />
                ) : (
                  <Chip size="small" label="Бесплатно" color="success" variant="outlined" />
                )}

                {liked && <Chip size="small" label="Вы идёте" color="success" />}
                {paid && <Chip size="small" label="Оплачено" color="success" />}
              </Stack>
            </Box>
          </Stack>

          {/* PARTICIPANTS */}
          {!withoutUsers && (
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroupUsers users={meet.users || []} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {meet.users?.length || 0} идут
              </Typography>
            </Stack>
          )}
        </Stack>
        {!liked && !withoutAction && (
          <Button onClick={handleJoin} variant="contained">
            Участвовать во встрече
          </Button>
        )}
        {liked && !withoutAction && meet.price && (
          <>
            <Button onClick={handlePay} variant="contained">
              Оплатить онлайн
            </Button>
            {!paid && <Button onClick={handleKassa} variant="contained">
              Касса
            </Button>}
          </>
        )}
      </Box>
    </Card>
  );
}

export default Meet;
