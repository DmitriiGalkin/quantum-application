import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { MeetDto } from '@shared/types';
import InfoItem from './InfoItem.tsx';
import UserGroup from './UserGroup.tsx';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';

type MeetCardProps = {
  meet: MeetDto;
  isMeetUserActionPending: boolean;
  onCreateMeetUser?: (meetId: number) => void;
  onDeleteMeetUser: (meetUserId: number) => void;
};

function MapDialog({ meet, isMeetUserActionPending, onCreateMeetUser, onDeleteMeetUser }: MeetCardProps) {

  return (
    <Dialog open={isAuthModalOpen} fullScreen={false} onClose={() => setIsAuthModalOpen(false)}>
      <DialogTitle>
        <Button onClick={() => setIsAuthModalOpen(false)} startIcon={<CloseIcon />}>
          Закрыть
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: {
              xs: 'stretch',
              sm: 'center',
            },
            justifyContent: 'space-between',
          }}
        >
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Выберите удобный способ авторизации
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {STRATEGIES.map(strategy => (
              <Button
                component="a"
                variant="contained"
                href={strategy.href}
                key={strategy.title}
                sx={{ minWidth: 120 }}
                onClick={() => {
                  localStorage.setItem('message_after_login', strategy.title);
                }}
              >
                <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
                  {strategy.icon}
                </Box>
                {strategy.title}
              </Button>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default MapDialog;
