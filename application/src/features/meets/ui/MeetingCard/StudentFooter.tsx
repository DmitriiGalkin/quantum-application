import { Button, Chip, Stack, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
  onPay: () => void;
  onJoin: () => void;
}

export default function StudentFooter({ meeting, onPay, onJoin }: Props) {
  const isMember = meeting.meetUserStatus === 'member';
  const isPending = meeting.paymentStatus === 'pending';
  const isPaid = meeting.paymentStatus === 'paid';
  // const isUpcoming = meeting.status === 'upcoming';
  // const isToday = meeting.status === 'today';

  return (
    <Stack spacing={1.5}>
      {/* PAYMENT STATE */}
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Оплата
        </Typography>

        <Chip size="small" label={isPaid ? 'Оплачено' : 'Ожидает оплату'} color={isPaid ? 'success' : 'warning'} />
      </Stack>

      {/* ACTIONS */}
      <Stack spacing={1}>
        {!isMember && (
          <Button variant="contained" fullWidth onClick={onJoin}>
            Присоединиться
          </Button>
        )}

        {isMember && isPending && (
          <Button variant="contained" fullWidth onClick={onPay}>
            Оплатить
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
