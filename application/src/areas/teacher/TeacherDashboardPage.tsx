import { Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherDashboard } from '../../requests.ts';
import MeetCard from '../../features/meets/ui/MeetCard/MeetCard.tsx';

export default function TeacherDashboardPage() {

  const { data } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: fetchTeacherDashboard,
  });

  if (!data) return null;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Кабинет учителя</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{data.projects}</Typography>

              <Typography color="text.secondary">Проектов</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{data.meets}</Typography>

              <Typography color="text.secondary">Встреч на неделе</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{data.students}</Typography>

              <Typography color="text.secondary">Учеников</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{data.debit} рублей</Typography>

              <Typography color="text.secondary">Доход</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5">Быстрые действия</Typography>

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

      <Typography variant="h5">Ближайшие встречи</Typography>

      <Stack spacing={2}>
        {data.bmeets.map(meet => (
          <MeetCard key={meet.id} meet={meet} />
        ))}
      </Stack>
    </Stack>
  );
}
