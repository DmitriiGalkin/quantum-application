import { Avatar, Paper, Typography } from '@mui/material';
import type { User } from './types.ts';

type UserCardProps = {
  user: User;
};

function UserCard ({ user }: UserCardProps) {
  return (
    <Paper
      component="article"
      elevation={0}
      key={user.id}
      sx={{
        p: 2,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'grey.100',
      }}
    >
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

      <Typography sx={{ fontWeight: 800 }}>{user.title ?? 'Без имени'}</Typography>

      {user.age !== null && user.age !== undefined && (
        <Typography variant="body2" color="text.secondary">
          {user.age} лет
        </Typography>
      )}
    </Paper>
  )
}

export default UserCard;
