import { Button, Stack, Chip, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
  onPrimaryAction: () => void;
}

export default function PlaceFooter({ meeting, onPrimaryAction }: Props) {
  const occupancy = `${meeting.enrolled}/${meeting.capacity}`;

  return (
    <Stack spacing={1.5}>
      {/* BUSINESS METRIC */}
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Загруженность
        </Typography>

        <Chip size="small" label={occupancy} color={meeting.enrolled / meeting.capacity > 0.8 ? 'warning' : 'default'} />
      </Stack>

      {/* ACTION */}
      <Button variant="contained" fullWidth onClick={onPrimaryAction}>
        Управление
      </Button>
    </Stack>
  );
}
