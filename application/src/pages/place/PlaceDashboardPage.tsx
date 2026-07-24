import { Card, CardActionArea, CardContent, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchPlace, fetchUpdatePlace } from '../../requests.ts';
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import PlaceForm, { type PlaceFormValues } from '../../features/place/PlaceForm.tsx';
import EditIcon from '@mui/icons-material/Edit';
import type { PlaceScheduleDayDto } from '../../features/place/PlaceScheduleRow.tsx';

export const DEFAULT_PLACE_SCHEDULE: PlaceScheduleDayDto[] = [
  { weekday: 1, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 2, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 3, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 4, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 5, enabled: true, startTime: '09:00', endTime: '21:00' },
  { weekday: 6, enabled: true, startTime: '10:00', endTime: '18:00' },
  { weekday: 0, enabled: false, startTime: '09:00', endTime: '21:00' },
];

export default function PlaceDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const { data: place, refetch } = useQuery({
    queryKey: ['place', id],
    queryFn: () => fetchPlace(Number(id)),
    enabled: Boolean(id),
  });
  const [values, setValues] = useState<PlaceFormValues | null>(null);


  const updatePlace = useMutation({
    mutationFn: () => fetchUpdatePlace(Number(id), values!),

    onSuccess: () => {
      refetch?.();
      setIsPlaceModalOpen(false);
    },
  });

  // TODO: заменить на useQuery(fetchPlaceDashboard)
  const stats = {
    teachers: 5,
    projects: 12,
    users: 86,
    meets: 7,
  };

  useEffect(() => {
    if (place && !values) {
      setValues({
        title: place.title || '',
        description: place.description || '',
        image: place.image || '',
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,

        schedule: DEFAULT_PLACE_SCHEDULE,
      });
    }
  }, [place, values]);

  if (!place || !values) return null;

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          Кабинет центра
        </Typography>
        <IconButton onClick={() => setIsPlaceModalOpen(true)}>
          <EditIcon sx={{ color: 'white' }} />
        </IconButton>
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
              <Typography variant="h4">{stats.users}</Typography>

              <Typography color="text.secondary">Учеников</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.meets}</Typography>

              <Typography color="text.secondary">Встреч на неделе</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5">Быстрые действия</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/${place.id}/teachers`}>
              <CardContent>
                <Typography>Учителя</Typography>

                <Typography color="text.secondary">Управление преподавателями</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/${place.id}/projects`}>
              <CardContent>
                <Typography>Проекты</Typography>

                <Typography color="text.secondary">Все проекты центра</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to={`/place/${place.id}/meets`}>
              <CardContent>
                <Typography>Расписание</Typography>

                <Typography color="text.secondary">Ближайшие встречи</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={isPlaceModalOpen} onClose={() => setIsPlaceModalOpen(false)}>
        <DialogTitle>Редактирование центра</DialogTitle>
        <DialogContent>
          <PlaceForm
            values={values}
            onChange={setValues}
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
