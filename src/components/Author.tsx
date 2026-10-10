import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { UserDto } from 'entities';

export const Author = ({ user }: { user: UserDto }) => {
    return (
      <Typography variant="caption" align="right" sx={{ marginLeft: 'auto', color: 'text.secondary' }}>
        <Link href={`/user/${user.id}/ideas`} sx={{ color: 'text.secondary', textDecoration: 'dashed' }}>
          {user.title}, {user.age} лет
        </Link>
      </Typography>
    );
};