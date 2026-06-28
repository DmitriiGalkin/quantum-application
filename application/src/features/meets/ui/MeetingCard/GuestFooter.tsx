import { Button, Stack } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
  onOpen: () => void;
}

export default function GuestFooter({ meeting, onOpen }: Props) {
  const isCancelled = meeting.status === 'cancelled';

  return (
    <Stack spacing={1.5}>
      <Button variant="contained" fullWidth onClick={onOpen} disabled={isCancelled}>
        {isCancelled ? 'Недоступно' : 'Подробнее'}
      </Button>
    </Stack>
  );
}
