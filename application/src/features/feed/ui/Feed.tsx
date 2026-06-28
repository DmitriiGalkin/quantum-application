import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { FeedItem, MeetExtendedDto, PassportDto, UserDto } from '@shared/types';
import Meet from '../../meets/ui/MeetComponent.tsx';
import MeetOld from '../../meets/ui/Meet.tsx';
import MeetingCardContainer, { toMeeting } from '../../meets/ui/MeetingCard/MeetingCardContainer.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';

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
          {/*<Meet meet={item.meet} passport={passport} refetch={refetch} />*/}
          {/*<MeetOld meet={item.meet} passport={passport} refetch={refetch} />*/}
          <MeetFeedCard m={item.meet} />
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

function MeetFeedCard({ m }: { m: MeetExtendedDto }) {
  const { activeRole } = useAuth();
  const openMeeting = () => console.log('openMeeting');
  const payMeeting = () => console.log('payMeeting');

  return <MeetingCardContainer key={m.id} meeting={toMeeting(m)} role={activeRole} onOpen={openMeeting} onPay={payMeeting} />;
}