import { Box, Chip, Stack, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

interface Props {
  meeting: Meeting;
}

const statusConfig = {
  today: { label: 'Today', color: 'success' as const },
  upcoming: { label: 'Upcoming', color: 'info' as const },
  completed: { label: 'Completed', color: 'default' as const },
  cancelled: { label: 'Cancelled', color: 'error' as const },
};

export default function MeetingCardHeader({ meeting }: Props) {
  const status = statusConfig[meeting.status];

  return (
    <Stack spacing={1}>
      {/* TOP ROW: status + time */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip label={status.label} color={status.color} size="small" />

        <Typography variant="body2" color="text.secondary">
          {meeting.date} • {meeting.time}
        </Typography>
      </Stack>

      {/* TITLE */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            lineHeight: 1.2,
            fontWeight: 700,
          }}
        >
          {meeting.title}
        </Typography>
      </Box>
    </Stack>
  );
}
