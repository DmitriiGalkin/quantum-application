import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserDto } from '@shared/types';
import MenuButton from '../../components/MenuButton.tsx';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

type UserCardProps = {
  user: UserDto;
};

function UserCard({ user }: UserCardProps) {
  const menuItems = [];

  menuItems.push({
    key: 'leave',
    label: 'Написать родителю',
    icon: <PersonRemoveIcon fontSize="small" />,
    onClick: () => console.log('leave'),
  });

  return (
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            <Typography sx={{ fontWeight: 800 }}>{user.title ?? 'Без имени'}</Typography>
            {user.age !== null && user.age !== undefined && <Typography>{user.age} лет</Typography>}
          </Stack>
          <MenuButton menuItems={menuItems} />
        </Stack>

        {user.description !== null && user.description !== undefined && <Typography>{user.description}</Typography>}
      </Stack>
    </Stack>
  );
}

export default UserCard;
