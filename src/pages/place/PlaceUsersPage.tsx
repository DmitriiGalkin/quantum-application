import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceUsers } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import UserCard from '../../features/user/UserCard.tsx';

export default function PlaceUsersPage() {
  const { placeId } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ['place-users', placeId],
    queryFn: fetchPlaceUsers,
  });

  return (
    <Stack spacing={3}>
      {users.length === 0 && <Typography color="text.secondary">В центре пока нет учеников</Typography>}

      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}{' '}
    </Stack>
  );
}
