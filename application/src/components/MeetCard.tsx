import type { MeetExtendedDto } from '@shared/types';
import { Avatar, Button, Card, CardActions, CardHeader, CardContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeetUser } from '../requests.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useEffect, useState } from 'react';
import AvatarGroupUsers from './AvatarGroupUsers.tsx';
import Typography from '@mui/material/Typography';
import ProjectMeetCard from './ProjectMeetCard.tsx';
import Box from '@mui/material/Box';

type MeetListItemProps = {
  meet: MeetExtendedDto;
  refetch?: () => void;
};

function MeetCard({ meet, refetch }: MeetListItemProps) {
  const { user, authHandler } = useAuth();
  const [liked, setLiked] = useState(false);

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      setLiked(true);
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      setLiked(false);
      refetch?.();
    },
  });

  const handleLike = () => {
    if (user)
      if (!liked) {
        user && mutationLike.mutate({ userId: user.id, meetId: meet.id });
      } else {
        user && mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
      }
    else authHandler();
  };

  useEffect(() => {
    if (user && meet.users.map(user => user.id).includes(user.id)) {
      setLiked(true);
    }
  }, [user]);

  const subheader =
    new Date(meet.startedAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    }) +
    ', ' +
    new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Card>
      <CardHeader avatar={<Avatar>R</Avatar>} title="Дмитрий Галкин" subheader={subheader} />
      <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)', borderRadius: 2 }}>
        <ProjectMeetCard meet={meet} />
      </Box>
      <CardActions>
        <Button onClick={() => handleLike()}>{liked ? 'Отменить участие' : 'Участвовать'}</Button>
      </CardActions>
    </Card>
  );
}

export default MeetCard;
