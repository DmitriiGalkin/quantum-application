import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProjects, fetchPlaceUsers } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';
import UserCard from '../../features/user/UserCard.tsx';

export default function PlaceUsersPage() {
  const { activePlace } = useAuth();
  const id = activePlace?.id;
  const placeId = Number(id);

  const { data: users = [], refetch } = useQuery({
    queryKey: ['place-users', placeId],
    queryFn: () => fetchPlaceUsers(2),
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
