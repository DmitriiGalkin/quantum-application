import { Button, Chip, Stack, Typography } from '@mui/material';
import type { MeetExtendedDto } from '@shared/types';

interface Props {
  meet: MeetExtendedDto;
  onEdit: () => void;
}

export default function PlaceFooter({ meet, onEdit }: Props) {
  const occupancy = (meet.users?.length ?? 0) / 30;
  const occupancyTitle = `${meet.users?.length ?? 0}/30`;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Загруженность
        </Typography>

        <Chip size="small" label={occupancyTitle} color={occupancy > 0.8 ? 'warning' : 'default'} />
      </Stack>

      <Button variant="contained" fullWidth onClick={onEdit}>
        Управление
      </Button>
    </Stack>
  );
}
