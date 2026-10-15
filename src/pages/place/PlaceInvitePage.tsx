import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { fetchAddTeacher2, fetchPlace } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import Alert from '@mui/material/Alert';

export default function PlaceInvitePage() {
  const { id } = useParams();
  const placeId = Number(id);
  const { passport, authHandler, refetch: refreshPassport } = useAuth();
  const validId = Number.isSafeInteger(placeId) && placeId > 0;
  const navigate = useNavigate();


  const { data: place, isPending, isError, refetch } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => fetchPlace(placeId),
    enabled: validId,
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher2({passportId: Number(passport?.id), placeId }),
    onSuccess: async () => {
      await refreshPassport();
      navigate(`/places/${placeId}`);
    },
  });
  if (!validId) return <Alert severity="info">В ссылке приглашения не указан центр. Попросите организатора прислать полную ссылку.</Alert>;
  if (isPending) return <Typography role="status">Загрузка приглашения…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить приглашение.</Alert>;

  return (
    <Box>
      <Card>
        <CardHeader title={place?.title} subheader="Приглашает вас стать преподавателем" />

        <CardContent>
          <Typography>Присоединитесь к центру как преподаватель. Управление центром остаётся у его администраторов.</Typography>
          {addTeacher.isError && <Alert severity="error" sx={{ mt: 2 }}>{addTeacher.error.message}</Alert>}
        </CardContent>

        <CardActions>
          <Button variant="contained" disabled={addTeacher.isPending} onClick={() => passport ? addTeacher.mutate() : authHandler(`/place/${placeId}/invite`)}>
            {addTeacher.isPending ? 'Подтверждение…' : passport ? 'Принять приглашение' : 'Войти и продолжить'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
