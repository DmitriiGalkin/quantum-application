import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FeedItem, PassportDto, UserDto } from 'entities';
import MeetCard from '../meets/MeetCard.tsx';

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
    <Divider variant="middle" sx={{ color: 'text.secondary', borderColor: 'divider', display: 'flex', alignItems: 'center', overflowWrap: 'anywhere', '& .MuiDivider-wrapper': { whiteSpace: 'normal' } }}>
      <Typography variant="body2">
        {user?.title} присоединился к проекту
      </Typography>
    </Divider>
  );
}
