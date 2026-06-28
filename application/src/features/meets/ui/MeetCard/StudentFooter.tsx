import { Button, Chip, Stack, Typography } from '@mui/material';
import type { MeetExtendedDto } from '@shared/types';
import { onKassa } from './helper.ts';

interface Props {
  meet: MeetExtendedDto;
  onPay?: () => void;
  onJoin?: () => void;
  onExit?: () => void;
}

export default function StudentFooter({ meet, onPay, onJoin, onExit }: Props) {
  const paymentStatus = meet.isPaid ? 'paid' : meet.price != null ? 'pending' : undefined;
  const isPaid = paymentStatus === 'paid';


  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Оплата
        </Typography>

        <Chip size="small" label={isPaid ? 'Оплачено' : 'Ожидает оплату'} color={isPaid ? 'success' : 'warning'} />
      </Stack>

      <Stack spacing={1}>
        {onJoin && (
          <Button variant="contained" fullWidth onClick={onJoin}>
            Присоединиться
          </Button>
        )}

        {onPay && (
          <Button variant="contained" fullWidth onClick={onPay}>
            Оплатить
          </Button>
        )}

        {onKassa && (
          <Button fullWidth onClick={onKassa}>
            Подтвердить оплату себе
          </Button>
        )}

        {onExit && (
          <Button fullWidth onClick={onExit}>
            Выйти
          </Button>
        )}

        {onExit && (
          <Button fullWidth onClick={onExit}>
            Выйти и вернуть деньги
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
