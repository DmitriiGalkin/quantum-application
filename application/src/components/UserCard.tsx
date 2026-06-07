import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { User } from '@shared/types';

type UserCardProps = {
  user: User;
};

function UserCard({ user }: UserCardProps) {
  return (
    <Paper
      component="article"
      elevation={0}
      key={user.id}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'grey.100',
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar
          src={user.image ?? undefined}
          alt={user.title ?? 'Участник'}
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1,
          }}
        />
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1}>
            <Typography sx={{ fontWeight: 800 }}>{user.title ?? 'Без имени'}</Typography>
            {user.age !== null && user.age !== undefined && <Typography>{user.age} лет</Typography>}
          </Stack>
          {user.description !== null && user.description !== undefined && (
            <Typography>{user.description}</Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default UserCard;
