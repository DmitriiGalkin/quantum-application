import { Button, Stack } from '@mui/material';

interface Props {
  onPay?: () => void;
  onJoin?: () => void;
}

export default function StudentFooter({ onPay, onJoin }: Props) {
  return (
    <Stack spacing={1.5}>
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

      </Stack>
    </Stack>
  );
}
