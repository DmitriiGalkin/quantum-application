import type { MeetFullDto } from '@shared/types';
import { Avatar, AvatarGroup, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeetUser } from '../requests.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useEffect, useState } from 'react';

type MeetListItemProps = {
  meet: MeetFullDto;
  refetch: () => void;
};

function MeetListItem({ meet, refetch }: MeetListItemProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      setLiked(true);
      refetch();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      setLiked(false);
      refetch();
    },
  });

  const handleLike = () => {
    if (user)
      if (!liked) {
        user && mutationLike.mutate({ userId: user.id, meetId: meet.id });
      } else {
        user && mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
      }
  };

  useEffect(() => {
    if (user && meet.users.map(user => user.id).includes(user.id)) {
      setLiked(true);
    }
  }, [user]);

  return (
    <>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemAvatar>
          <AvatarGroup>
            {meet.users?.map(user => (
              <Avatar alt={user.title} src={user.image || ''} sx={{ width: 32, height: 32 }} />
            ))}
          </AvatarGroup>
        </ListItemAvatar>
        <ListItemText
          primary={new Date(meet.startedAt).toLocaleDateString('ru-RU')}
          secondary={new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        {user && (
          <ListItemButton component="a" href="#simple-list" onClick={() => handleLike()}>
            <ListItemText primary={liked ? 'Отменить участие' : 'Участвовать'} />
          </ListItemButton>
        )}
      </ListItem>
    </>
  );
}

export default MeetListItem;
