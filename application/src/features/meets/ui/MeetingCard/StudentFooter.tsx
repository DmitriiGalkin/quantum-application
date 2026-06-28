import { Button, Chip, Stack, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
  onPay: () => void;
  onJoin: () => void;
  onCancel: () => void;
}

export default function StudentFooter({ meeting, onPay, onJoin, onCancel }: Props) {
  const isMember = meeting.meetUserStatus === 'member';
  const isPending = meeting.paymentStatus === 'pending';
  const isPaid = meeting.paymentStatus === 'paid';

  if(Number(meeting.id) === 18) {
    console.log(isMember, isPending, isPaid);
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Оплата
        </Typography>

        <Chip size="small" label={isPaid ? 'Оплачено' : 'Ожидает оплату'} color={isPaid ? 'success' : 'warning'} />
      </Stack>

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

        {isMember && isPending && (
          <Button fullWidth onClick={onCancel}>
            Выйти
          </Button>
        )}

        {isMember && isPaid && (
          <Button fullWidth onClick={onCancel}>
            Выйти и вернуть деньги
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
