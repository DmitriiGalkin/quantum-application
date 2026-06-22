import Stack from '@mui/material/Stack';
import type { UserDto } from '@shared/types';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';


type UserGroupProps = {
  users: UserDto[];
};

function AvatarGroupUsers({ users }: UserGroupProps) {
  const etc = users.length - 5;

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <AvatarGroup max={5}>
        {users.map(user => (
          <Avatar src={user.image || ''} alt="Участник" key={user.id} sx={{ width: 32, height: 32 }} />
        ))}
      </AvatarGroup>

      {etc > 0 && <Chip label={`+${etc} участников`} color="primary" variant="outlined" />}
    </Stack>
  );
}

export default AvatarGroupUsers;