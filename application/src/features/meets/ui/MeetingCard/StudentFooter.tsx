import { Button, Stack, Chip, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export default function StudentFooter({ meeting, onPrimaryAction, onSecondaryAction }: Props) {
  const isPaid = meeting.paymentStatus === 'paid';

  const isUpcoming = meeting.status === 'upcoming';
  const isToday = meeting.status === 'today';

  const getPrimaryLabel = () => {
    if (!isPaid) return 'Оплатить';
    if (isToday) return 'Присоединиться';
    if (isUpcoming) return 'Подробнее';
    return 'Открыть';
  };

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
        <Button variant="contained" fullWidth onClick={onPrimaryAction}>
          {getPrimaryLabel()}
        </Button>

        {!isPaid && (
          <Button variant="text" fullWidth onClick={onSecondaryAction}>
            Подробнее
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
