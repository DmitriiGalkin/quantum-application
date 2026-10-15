import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserDto } from 'entities';
import MenuButton from '../../components/MenuButton.tsx';
import ChatIcon from '@mui/icons-material/Chat';
import { useState } from 'react';
import ChatDialog from '../../components/ChatDialog.tsx';

type UserCardProps = {
  user: UserDto;
};

function UserCard({ user }: UserCardProps) {
  const [contact, setContact] = useState(false);
  const menuItems = [];

  menuItems.push({
    key: 'leave',
    label: 'Написать родителю',
    icon: <ChatIcon fontSize="small" />,
    onClick: () => setContact(true),
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
      <Stack direction="column" spacing={1} sx={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            <Typography sx={{ fontWeight: 800 }}>{user.title ?? 'Без имени'}</Typography>
            {user.age !== null && user.age !== undefined && <Typography>{user.age} лет</Typography>}
          </Stack>
          <MenuButton menuItems={menuItems} />
        </Stack>

        {user.description !== null && user.description !== undefined && <Typography>{user.description}</Typography>}
      </Stack>
      {contact && <ChatDialog open parentUserId={user.id} onClose={() => setContact(false)} />}
    </Stack>
  );
}

export default UserCard;
