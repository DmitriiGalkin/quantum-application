import type { MeetExtendedDto } from '@shared/types';
import { Avatar, Button, Card, CardActions, CardHeader, CardContent } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeetUser } from '../requests.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useEffect, useState } from 'react';
import AvatarGroupUsers from './AvatarGroupUsers.tsx';
import Typography from '@mui/material/Typography';

type MeetListItemProps = {
  meet: MeetExtendedDto;
  refetch?: () => void;
};

function MeetListItem({ meet, refetch }: MeetListItemProps) {
  const { user, login } = useAuth();
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
    else login();
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
      <CardContent>
        <AvatarGroupUsers users={meet.users} />
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{meet.price ? `${meet.price} ₽` : 'Бесплатно'}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => handleLike()}>{liked ? 'Отменить участие' : 'Участвовать'}</Button>
      </CardActions>
    </Card>
  );
}

export default MeetListItem;
