import { Avatar, Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { FeedItem, PassportDto, UserDto } from '@shared/types';
import MeetCard from '../meets/ui/MeetCard/MeetCard.tsx';

export function Feed({ items, passport, refetch }: { items: FeedItem[]; passport: PassportDto; refetch: () => void }) {
  return (
    <Stack spacing={2}>
      {items.map(item => (
        <FeedItemView key={item.id} item={item} passport={passport} refetch={refetch} />
      ))}
    </Stack>
  );
}

function FeedItemView({ item, refetch }: { item: FeedItem; passport: PassportDto; refetch: () => void }) {
  switch (item.type) {
    case 'meet':
      return <MeetCard key={item.id} meet={item.meet} refetch={refetch} />;

    case 'comment':
      return <CommentCard key={item.id} comment={item.comment} user={item.user as UserDto} />;

    case 'join':
      return <JoinCard key={item.id} user={item.user as UserDto} />;

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
