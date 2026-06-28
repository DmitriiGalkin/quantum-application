import { Paper, Stack } from '@mui/material';
import type { MeetingCardProps } from './MeetingCard.types';

import MeetingCardHeader from './MeetingCardHeader';
import MeetingCardBody from './MeetingCardBody';
import StudentFooter from './StudentFooter';
import TeacherFooter from './TeacherFooter';
import GuestFooter from './GuestFooter';
import PlaceFooter from './PlaceFooter';

export default function MeetingCard({ role, meeting, onPrimaryAction, onSecondaryAction }: MeetingCardProps) {
  const { status } = meeting;

  const renderFooter = () => {
    switch (role) {
      case 'user':
        return <StudentFooter meeting={meeting} onPrimaryAction={onPrimaryAction} onSecondaryAction={onSecondaryAction} />;

      case 'teacher':
        return <TeacherFooter meeting={meeting} onPrimaryAction={onPrimaryAction} onSecondaryAction={onSecondaryAction} />;

      case 'place':
        return <PlaceFooter meeting={meeting} onPrimaryAction={onPrimaryAction} />;

      case 'guest':
      default:
        return <GuestFooter meeting={meeting} onPrimaryAction={onPrimaryAction} />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: '0.2s',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack spacing={2}>
        <MeetingCardHeader meeting={meeting} />

        <MeetingCardBody meeting={meeting} />

        {renderFooter()}
      </Stack>
    </Paper>
  );
}
