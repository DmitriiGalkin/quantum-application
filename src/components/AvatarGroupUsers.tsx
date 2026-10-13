import Stack from '@mui/material/Stack';
import type { UserDto } from 'entities';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';


type Props = {
  users: UserDto[];
  limit?: number;
};

function AvatarGroupUsers({ users, limit }: Props) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', maxWidth: '100%' }}>
      <AvatarGroup
        max={limit ? limit + (users.length > limit ? 1 : 0) : 5}
        sx={{
          flexWrap: 'wrap',
          '& .MuiAvatar-root': {
            width: 24,
            height: 24,
            fontSize: 12,
          },
          '& .MuiAvatarGroup-avatar': {
            width: 24,
            height: 24,
            fontSize: 12,
          },
        }}
      >
        {users.map(user => (
          <Avatar src={user.image || ''} alt={user.title || 'Участник'} title={user.title || 'Участник'} key={user.id} sx={{ width: 24, height: 24 }} />
        ))}
      </AvatarGroup>
    </Stack>
  );
}

export default AvatarGroupUsers;
