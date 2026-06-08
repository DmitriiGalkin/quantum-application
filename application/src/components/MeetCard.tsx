import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { MeetDto } from '@shared/types';
import InfoItem from './InfoItem.tsx';
import UserGroup from './UserGroup.tsx';

type MeetCardProps = {
  meet: MeetDto;
  isMeetUserActionPending: boolean;
  onCreateMeetUser: (meetId: number) => void;
  onDeleteMeetUser: (meetUserId: number) => void;
};


function MeetCard({ meet, isMeetUserActionPending, onCreateMeetUser, onDeleteMeetUser }: MeetCardProps) {
  const startedAt = new Date(meet.startedAt);
  const currentMeetUser = meet.users?.find(user => user.id === 2);
  const isCurrentUserVisited = Boolean(currentMeetUser);

  const infoItems = [
    {
      icon: EventIcon,
      value: startedAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      }),
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
      value: meet.price ? `${meet.price} ₽` : 'Бесплатно',
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
        <UserGroup users={meet.users || []} />

        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          {infoItems.map((item, index) => (
            <InfoItem
              key={index} // В реальном проекте лучше использовать уникальный ID из данных
              icon={item.icon}
              value={item.value}
            />
          ))}
        </Stack>

        <Button
          variant="contained"
          size="large"
          disabled={isMeetUserActionPending}
          onClick={() => {
            console.log('onClick', currentMeetUser);
            if (currentMeetUser?.meetUserId) {
              onDeleteMeetUser(currentMeetUser.meetUserId);

              return;
            }

            onCreateMeetUser(meet.id);
          }}
        >
          {isMeetUserActionPending ? 'Отправка...' : isCurrentUserVisited ? 'Выйти' : 'Участвовать'}
        </Button>
      </Stack>
    </Paper>
  );
}

export default MeetCard;
