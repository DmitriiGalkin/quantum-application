import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchPlaceDashboard, fetchPlaceMeets, fetchUpdatePlace } from '../../requests.ts';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import PlaceForm, { type PlaceFormValues } from '../../features/place/PlaceForm.tsx';
import EditIcon from '@mui/icons-material/Edit';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { DEFAULT_PLACE_SCHEDULE } from '../../features/place/default-schedule.ts';
import { useAuth } from '../../providers/auth-context.ts';
import { formatMoney } from '../../utils/time.ts';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MeetCard from '../../features/meets/MeetCard.tsx';
import { upcomingPublishedMeets } from '../../features/project/ui/project-card-meeting.ts';

export default function PlaceDashboardPage() {
  const { placeId } = useAuth();
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const { data, refetch, isPending, isError } = useQuery({
    queryKey: ['place-dashboard', placeId],
    queryFn: fetchPlaceDashboard,
    enabled: Boolean(placeId),
  });
  const meetings = useQuery({ queryKey: ['meets', 'place', placeId], queryFn: fetchPlaceMeets, enabled: Boolean(placeId) });
  const [draft, setDraft] = useState<{ placeId: number; values: PlaceFormValues } | null>(null);
  const place = data?.place;

  const values: PlaceFormValues | null = !place
    ? null
    : draft?.placeId === place.id
      ? draft.values
      : {
          title: place.title || '',
          phone: place.phone || '',
          description: place.description || '',
          image: place.image || '',
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          schedule: place.schedule ?? DEFAULT_PLACE_SCHEDULE,
        };

  const updatePlace = useMutation({
    mutationFn: () => fetchUpdatePlace(values!),

    onSuccess: () => {
      refetch?.();
      setIsPlaceModalOpen(false);
    },
  });

  if (!placeId) return <Typography>Выберите центр в меню профиля.</Typography>;
  if (isPending) return <Typography role="status">Загрузка кабинета центра…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить кабинет центра.</Alert>;
  if (!place || !data || !values) return <Typography>Сведения о центре недоступны.</Typography>;
  const stats = data.stats;
  const next = upcomingPublishedMeets(meetings.data ?? [])[0];

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          Кабинет центра
        </Typography>
        <IconButton aria-label="Редактировать центр" onClick={() => setIsPlaceModalOpen(true)}>
          <EditIcon sx={{ color: 'text.primary' }} />
        </IconButton>
      </Stack>
      {stats.pendingPlaceCount > 0 && <Alert severity="warning" action={<Button component={Link} to="/place/meets">Рассмотреть</Button>}>Ожидают решения: {stats.pendingPlaceCount} встреч.</Alert>}
      <Stack spacing={2}>
        <Typography component="h2" variant="h5">Ближайшая встреча в центре</Typography>
        {meetings.isPending ? <Typography role="status">Загрузка встреч…</Typography>
          : meetings.isError ? <Alert severity="error" action={<Button onClick={() => void meetings.refetch()}>Повторить</Button>}>Не удалось загрузить встречи центра.</Alert>
            : next ? <MeetCard meet={next} management={{ placeId }} refetch={() => void meetings.refetch()} />
              : <Typography>Ближайших подтверждённых встреч нет.</Typography>}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.teachers}</Typography>

              <Typography color="text.secondary">Учителей</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.projects}</Typography>

              <Typography color="text.secondary">Проектов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.meets}</Typography>

              <Typography color="text.secondary">Встреч на этой неделе</Typography>
              {!!stats.pendingPlaceCount && (
                <Stack sx={{ mt: 1 }}>
                  <Chip icon={<PendingActionsIcon />} label={`${stats.pendingPlaceCount} заявки на бронирование`} size="small" color="warning" />
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.users}</Typography>

              <Typography color="text.secondary">Учеников</Typography>
            </CardContent>
          </Card>
        </Grid>

        {stats.incoming !== null && (
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4">{formatMoney(stats.incoming)}</Typography>

                <Typography color="text.secondary">Оплачено за встречи (RUB)</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Typography variant="h5">Быстрые действия</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/teachers`}>
              <CardContent>
                <Typography>Учителя</Typography>

                <Typography color="text.secondary">Управление преподавателями</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/projects`}>
              <CardContent>
                <Typography>Проекты</Typography>

                <Typography color="text.secondary">Все проекты центра</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/meets`}>
              <CardContent>
                <Typography>Расписание</Typography>

                <Typography color="text.secondary">Ближайшие встречи</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={isPlaceModalOpen} onClose={() => setIsPlaceModalOpen(false)}>
        <ClosableDialogTitle onClose={() => setIsPlaceModalOpen(false)}>Редактирование центра</ClosableDialogTitle>
        <DialogContent>
          <PlaceForm
            values={values}
            onChange={values => setDraft({ placeId: place.id, values })}
            onSubmit={() => updatePlace.mutate()}
            loading={updatePlace.isPending}
            error={updatePlace.isError}
            submitLabel="Сохранить изменения"
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
