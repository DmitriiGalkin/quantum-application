import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceUsers } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import UserCard from '../../features/user/UserCard.tsx';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

export default function PlaceUsersPage() {
  const { placeId } = useAuth();

  const { data: users = [], isPending, isError, refetch } = useQuery({
    queryKey: ['place-users', placeId],
    queryFn: fetchPlaceUsers,
    enabled: Boolean(placeId),
  });
  if (!placeId) return <Typography>Выберите центр в меню профиля.</Typography>;
  if (isPending) return <Typography role="status">Загрузка учеников центра…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить учеников центра.</Alert>;

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">Ученики центра</Typography>
      <Typography color="text.secondary">Дети с записью на прошедшие или будущие опубликованные встречи центра. Отдельный учёт явки не ведётся.</Typography>
      {users.length === 0 && <Typography color="text.secondary">В центре пока нет учеников</Typography>}

      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}{' '}
    </Stack>
  );
}
