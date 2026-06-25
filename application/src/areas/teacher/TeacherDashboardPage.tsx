import { Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function TeacherDashboardPage() {
  // TODO заменить на useQuery(fetchTeacherDashboard)
  const stats = {
    projects: 4,
    students: 18,
    meets: 3,
    ideas: 2,
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Кабинет учителя
      </Typography>

      <Grid container spacing={2}>
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
              <Typography variant="h4">{stats.students}</Typography>

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

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{stats.ideas}</Typography>

              <Typography color="text.secondary">Новых идей</Typography>
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
            <CardActionArea component={Link} to="/teacher/projects">
              <CardContent>
                <Typography>Мои проекты</Typography>

                <Typography color="text.secondary">Управление проектами</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/meets">
              <CardContent>
                <Typography>Встречи</Typography>

                <Typography color="text.secondary">Расписание занятий</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/ideas">
              <CardContent>
                <Typography>Идеи учеников</Typography>

                <Typography color="text.secondary">Новые предложения и заявки</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5">
        Ближайшие встречи
      </Typography>

      <Card>
        <CardContent>
          <Typography>Робототехника</Typography>

          <Typography color="text.secondary">Сегодня, 18:00</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography>Создание сайта</Typography>

          <Typography color="text.secondary">Завтра, 17:00</Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
