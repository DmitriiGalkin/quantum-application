import { Avatar, Box, Stack, Typography } from '@mui/material';
import type { Meeting } from './MeetingCard.types';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';

interface Props {
  meeting: Meeting;
}

export default function MeetingCardBody({ meeting }: Props) {
  return (
    <Stack spacing={1.5}>
      {/* TEACHER / ORGANIZER */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar src={meeting.teacherAvatar}>{meeting.teacherName[0]}</Avatar>

        <Box>
          <Typography sx={{ fontWeight: 600 }}>{meeting.teacherName}</Typography>

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
          <Typography variant="body2">{meeting.duration}</Typography>
        </Stack>

        {/* location */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <LocationOnOutlinedIcon fontSize="small" />
          <Typography variant="body2">{meeting.location}</Typography>
        </Stack>

        {/* participants (aggregated) */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleOutlinedIcon fontSize="small" />

          <Typography variant="body2">
            {meeting.enrolled}/{meeting.capacity} participants
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleOutlinedIcon fontSize="small" />

          <Typography variant="body2">
            {meeting.price}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
