import { Breadcrumbs, Card, CardActionArea, CardContent, Grid, Stack, Typography, Link as MUILink } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlace } from '../../requests.ts';

export default function PlaceDashboardPage() {
  const { id } = useParams<{ id: string }>();

  const { data: place } = useQuery({
    queryKey: ['place', id],
    queryFn: () => fetchPlace(id as string),
    enabled: Boolean(id),
  });

  // TODO: заменить на useQuery(fetchPlaceDashboard)
  const stats = {
    teachers: 5,
    projects: 12,
    users: 86,
    meets: 7,
  };

  if (!place) return null;

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <MUILink underline="hover" color="inherit" href="/">
          {place.title}
        </MUILink>
        <Typography sx={{ color: 'text.primary' }}>Dashboard</Typography>
      </Breadcrumbs>

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
    </Stack>
  );
}
