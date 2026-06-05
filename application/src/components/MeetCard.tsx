import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Meet, User } from '../types.ts';
import InfoItem from './InfoItem.tsx';

export interface ExtendedMeet extends Meet {
  users: User[];
}

type MeetCardProps = {
  meeting: ExtendedMeet;
  isMeetUserActionPending: boolean;
  onCreateMeetUser: (meetId: number) => void;
  onDeleteMeetUser: (meetUserId: number) => void;
};


function MeetCard({ meeting, isMeetUserActionPending, onCreateMeetUser, onDeleteMeetUser }: MeetCardProps) {
  const startedAt = new Date(meeting.startedAt);
  const currentUserVisit = meeting.users?.find(user => user.id === 2);
  const isCurrentUserVisited = Boolean(currentUserVisit);

  const infoItems = [
    {
      icon: EventIcon,
      value: startedAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      }),
      sx: { minWidth: 140 }, // Увеличиваем ширину только для этого элемента
    },
    {
      icon: ScheduleIcon,
      value: startedAt.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      icon: PaymentsIcon,
      value: meeting.price ? `${meeting.price} ₽` : 'Бесплатно',
    },
  ];

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          {infoItems.map((item, index) => (
            <InfoItem
              key={index} // В реальном проекте лучше использовать уникальный ID из данных
              icon={item.icon}
              value={item.value}
              sx={item.sx}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <AvatarGroup max={5}>
            {(meeting?.users || []).map(user => (
              <Avatar src={user.image || undefined} alt="Участник" key={user.id} />
            ))}
          </AvatarGroup>

          <Chip label="+5 участников" color="primary" variant="outlined" />
        </Stack>

        <Button
          variant="contained"
          size="large"
          disabled={isMeetUserActionPending}
          onClick={() => {
            if (currentUserVisit?.id) {
              onDeleteMeetUser(currentUserVisit.id);

              return;
            }

            onCreateMeetUser(meeting.id);
          }}
        >
          {isMeetUserActionPending ? 'Отправка...' : isCurrentUserVisited ? 'Выйти' : 'Участвовать'}
        </Button>
      </Stack>
    </Paper>
  );
}

export default MeetCard;
