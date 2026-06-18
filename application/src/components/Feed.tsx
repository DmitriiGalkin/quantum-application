import { Avatar, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { FeedItem, MeetDto, UserDto } from '@shared/types';
import MeetCard from './MeetCard';

export function Feed({ items }: { items: FeedItem[] }) {
  return (
    <Stack spacing={2}>
      {items.map(item => (
        <FeedItemView key={item.id} item={item} />
      ))}
    </Stack>
  );
}

function FeedItemView({ item }: { item: FeedItem }) {
  switch (item.type) {
    case 'meet':
      return <MeetCard meet={item.meet} />;

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
      {user?.title} присоединился к проекту
    </Divider>
  );
}

function formatWhen(date: string) {
  const d = new Date(date);
  const now = new Date();

  const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Завтра';
  if (diff < 7) return `Через ${diff} дн.`;

  return d.toLocaleDateString();
}
