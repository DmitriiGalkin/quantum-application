import { Link, Typography } from '@mui/material';
import type { UserDto } from 'dto';

export const Author = ({ user }: { user: UserDto }) => {
    return (
      <Typography variant="caption" align="right" sx={{ marginLeft: 'auto', color: 'text.secondary' }}>
        <Link href={`/user/${user.id}/ideas`} sx={{ color: 'text.secondary', textDecoration: 'dashed' }}>
          {user.title}, {user.age} лет
        </Link>
      </Typography>
    );
};