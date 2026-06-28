import { Avatar, AvatarGroup, Box, Button, Chip, LinearProgress, Paper, Stack, Typography, IconButton } from '@mui/material';

import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PersonRounded from '@mui/icons-material/PersonRounded';
import { type MeetingStatus, type UserDto } from '@shared/types';
import type { ActiveRole } from '../../../providers/AuthProvider.tsx';


interface MeetingCardProps {
  role: ActiveRole;

  title: string;

  teacher: {
    name: string;
    avatar?: string;
  };

  date: string;
  time: string;
  duration: string;

  location: string;

  status: MeetingStatus;

  participants: UserDto[];

  enrolled: number;

  capacity: number;

  paymentStatus?: 'paid' | 'pending';

  onPrimaryClick: () => void;

  onMenuClick?: () => void;
}

const statusMap = {
  today: {
    label: 'Today',
    color: 'success',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'info',
  },
  completed: {
    label: 'Completed',
    color: 'default',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error',
  },
} as const;

export default function MeetingCard({
  role,
  teacher,
  title,
  date,
  time,
  duration,
  location,
  status,
  participants,
  enrolled,
  capacity,
  paymentStatus,
  onPrimaryClick,
  onMenuClick,
}: MeetingCardProps) {
  const progress = (enrolled / capacity) * 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        transition: 'all .2s',

        '&:hover': {
          boxShadow: 6,
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={2.5}>
        {/* HEADER */}

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip label={statusMap[status].label} color={statusMap[status].color} size="small" />

          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {date} • {time}
            </Typography>

            {role === 'teacher' && (
              <IconButton size="small" onClick={onMenuClick}>
                <MoreVertRounded />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* TITLE */}

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        {/* TEACHER */}

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar src={teacher.avatar} />

          <Box>
            <Typography sx={{ fontWeight: 600 }}>{teacher.name}</Typography>

            <Typography variant="body2" color="text.secondary">
              Teacher
            </Typography>
          </Box>
        </Stack>

        {/* INFO */}

        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <ScheduleRounded fontSize="small" />
            <Typography variant="body2">{duration}</Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <LocationOnOutlined fontSize="small" />
            <Typography variant="body2">{location}</Typography>
          </Stack>
        </Stack>

        {/* PARTICIPANTS */}

        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PersonRounded fontSize="small" />

              <Typography variant="body2">
                {enrolled}/{capacity} participants
              </Typography>
            </Stack>

            <AvatarGroup max={4}>
              {participants.map(user => (
                <Avatar key={user.id} src={user.image || ''}>
                  {user.title[0]}
                </Avatar>
              ))}
            </AvatarGroup>
          </Stack>

          <LinearProgress
            value={progress}
            variant="determinate"
            sx={{
              height: 8,
              borderRadius: 99,
            }}
          />
        </Stack>

        {/* PAYMENT */}

        {role === 'user' && (
          <Chip
            color={paymentStatus === 'paid' ? 'success' : 'warning'}
            label={paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment'}
            sx={{ width: 'fit-content' }}
          />
        )}

        {/* FOOTER */}

        <Button fullWidth size="large" variant="contained" onClick={onPrimaryClick}>
          {role === 'teacher' ? 'Edit meeting' : paymentStatus === 'pending' ? 'Pay now' : 'Open details'}
        </Button>
      </Stack>
    </Paper>
  );
}
