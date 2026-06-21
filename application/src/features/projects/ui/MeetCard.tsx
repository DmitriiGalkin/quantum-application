import type { MeetExtendedDto, PassportDto } from '@shared/types';
import { Button, Card, CardActions } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeetUser } from '../../../requests.ts';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import ProjectMeetCard from './ProjectMeetCard.tsx';
import Box from '@mui/material/Box';
import MeetCardHeader from './MeetCardHeader.tsx';

type Props = {
  meet: MeetExtendedDto;
  refetch?: () => void;
  passport: PassportDto;
};

function MeetCard({ meet, refetch, passport }: Props) {
  const { user, authHandler } = useAuth();

  const liked = user && meet.users.some(u => u.id === user.id);
  console.log(user, meet, liked);

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const handleLike = () => {
    if (user) mutationLike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  const handleUnlike = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  return (
    <Card>
      <MeetCardHeader passport={passport} handleUnlike={liked && handleUnlike} />
      <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)', borderRadius: 2 }}>
        <ProjectMeetCard meet={meet} />
      </Box>
      {!liked && (
        <CardActions>
          <Button onClick={() => handleLike()} variant="contained">
            Участвовать
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default MeetCard;
