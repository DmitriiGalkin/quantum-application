import { useQuery } from '@tanstack/react-query';
import { fetchPlaceMeets } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import Meets from '../../features/meets/Meets.tsx';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function PlaceMeetsPage() {
  const { placeId } = useAuth();

  const { data: meets, refetch, isPending, error } = useQuery({
    queryKey: ['meets', 'place', placeId],
    queryFn: fetchPlaceMeets,
    enabled: Boolean(placeId),
  });

  if (!placeId || isPending) return <Typography role="status">Загрузка расписания…</Typography>;
  if (error) return <Alert severity="error" action={<Button onClick={() => refetch()}>Повторить</Button>}>Не удалось загрузить расписание: {error.message}</Alert>;
  if (!meets) return null;

  return <Meets title="Расписание центра" meets={meets} refetch={refetch} management={{ placeId }}/>;
}
