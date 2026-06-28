import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { FeedItem, MeetExtendedDto, PassportDto, UserDto } from '@shared/types';
import MeetingCardContainer, { toMeeting } from '../../meets/ui/MeetingCard/MeetingCardContainer.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeet, fetchDeleteMeetUser } from '../../../requests.ts';

export function Feed({ items, passport, refetch }: { items: FeedItem[]; passport: PassportDto; refetch: () => void }) {
  return (
    <Stack spacing={2}>
      {items.map(item => (
        <FeedItemView key={item.id} item={item} passport={passport} refetch={refetch} />
      ))}
    </Stack>
  );
}

function FeedItemView({ item, passport, refetch }: { item: FeedItem; passport: PassportDto; refetch: () => void }) {
  switch (item.type) {
    case 'meet':
      return (
        <>
          <MeetFeedCard meet={item.meet} refetch={refetch} />
        </>
      );

    case 'comment':
      return <CommentCard comment={item.comment} user={item.user as UserDto} />;

    case 'join':
      return <JoinCard user={item.user as UserDto} />;

    default:
      return null;
  }
}

function CommentCard({
  comment,
  user,
}: {
  comment: {
    id: number;
    text: string;
  };
  user: UserDto;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Avatar>{user?.title[0]}</Avatar>
          <Box>
            <Typography variant="subtitle2">{user?.title}</Typography>
            <Typography>{comment.text}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function JoinCard({ user }: { user: UserDto }) {
  return (
    <Divider variant="middle" sx={{ color: 'background.paper', borderColor: 'primary.main', display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2">
        {user?.title} присоединился к проекту
      </Typography>
    </Divider>
  );
}

function MeetFeedCard({ meet, refetch }: { meet: MeetExtendedDto; refetch: any }) {
  const { activeRole, user, authHandler } = useAuth();

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

  const mutationDeleteMeet = useMutation({
    mutationFn: fetchDeleteMeet,
    onSuccess: () => {
      refetch?.();
    },
  });

  const openMeeting = () => console.log('openMeeting');

  const payMeeting = () => console.log('payMeeting');

  const onJoin = async () => {
    if (!user) {
      authHandler();
      return;
    }

    mutationLike.mutate({
      meetId: meet.id,
      userId: user.id,
    });
  };

  const onCancel = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  const onDelete = async () => {
    mutationDeleteMeet.mutate(meet.id);
  };

  return (
    <MeetingCardContainer
      key={meet.id}
      meeting={toMeeting(meet, user)}
      role={activeRole}
      onOpen={openMeeting}
      onPay={payMeeting}
      onJoin={onJoin}
      onCancel={onCancel}
      onDelete={onDelete}
    />
  );
}