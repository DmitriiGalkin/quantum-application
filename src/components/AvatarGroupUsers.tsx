import Stack from '@mui/material/Stack';
import type { UserDto } from 'dto';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import { getImage } from '../../utils/helper.ts';


type Props = {
  users: UserDto[];
};

function AvatarGroupUsers({ users }: Props) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <AvatarGroup
        max={5}
        sx={{
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
          <Avatar src={getImage(user.id) || user.image || ''} alt="Участник" key={user.id} sx={{ width: 24, height: 24 }} />
        ))}
      </AvatarGroup>
    </Stack>
  );
}

export default AvatarGroupUsers;