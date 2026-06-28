import { Avatar, Box, Stack, Typography } from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import type { MeetExtendedDto } from '@shared/types';

interface Props {
  meet: MeetExtendedDto;
}

export default function MeetingCardBody({ meet }: Props) {
  const name = meet.passport?.title ?? 'Unknown';
  const duration = meet.duration != null ? `${meet.duration} min` : '—';

  return (
    <Stack spacing={1.5}>
      {/* TEACHER / ORGANIZER */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar src={meet.passport?.image ?? undefined}>{name[0]}</Avatar>

        <Box>
          <Typography sx={{ fontWeight: 600 }}>{name}</Typography>

          <Typography variant="body2" color="text.secondary">
            Teacher
          </Typography>
        </Box>
      </Stack>

      {/* META INFO */}
      <Stack spacing={1}>
        {/* duration */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleOutlinedIcon fontSize="small" />
          <Typography variant="body2">{duration}</Typography>
        </Stack>

        {/* location */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <LocationOnOutlinedIcon fontSize="small" />
          <Typography variant="body2">{meet.place?.address ?? 'Unknown location'}</Typography>
        </Stack>

        {/* participants (aggregated) */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleOutlinedIcon fontSize="small" />

          <Typography variant="body2">
            {meet.users?.length ?? 0}/30 participants
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleOutlinedIcon fontSize="small" />

          <Typography variant="body2">{meet.price}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
