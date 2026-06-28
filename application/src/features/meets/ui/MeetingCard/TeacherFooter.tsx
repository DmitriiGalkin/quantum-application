import { Button, Stack, IconButton } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface Props {
  meeting: Meeting;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export default function TeacherFooter({ meeting, onPrimaryAction, onSecondaryAction }: Props) {
  const isCancelled = meeting.status === 'cancelled';

  const getPrimaryLabel = () => {
    if (isCancelled) return 'Просмотр';
    if (meeting.status === 'completed') return 'Открыть';
    return 'Изменить';
  };

  return (
    <Stack spacing={1.5}>
      {/* PRIMARY ACTION */}
      <Button variant="contained" fullWidth onClick={onPrimaryAction} disabled={isCancelled}>
        {getPrimaryLabel()}
      </Button>

      {/* SECONDARY ACTIONS */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="text" onClick={onSecondaryAction}>
          Перенести / Отменить
        </Button>

        {/* overflow menu */}
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
