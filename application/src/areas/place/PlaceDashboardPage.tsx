import { Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PlaceDashboardPage() {
  // TODO: заменить на useQuery(fetchPlaceDashboard)
  const stats = {
    teachers: 5,
    projects: 12,
    users: 86,
    meets: 7,
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Центр
      </Typography>

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

      <Typography variant="h5">
        Быстрые действия
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/place/teachers">
              <CardContent>
                <Typography >Учителя</Typography>

                <Typography color="text.secondary">Управление преподавателями</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/place/projects">
              <CardContent>
                <Typography>Проекты</Typography>

                <Typography color="text.secondary">Все проекты центра</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/place/meets">
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
