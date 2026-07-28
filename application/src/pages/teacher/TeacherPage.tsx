import { Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacher } from '../../requests.ts';

export default function TeacherPage() {
  const { id } = useParams<{ id: string }>();

  const { data: teacher } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => fetchTeacher(Number(id)),
    enabled: Boolean(id),
  });

  if (!teacher) return null;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Кабинет учите23ля</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{teacher.projects.length}</Typography>

              <Typography color="text.secondary">Проектов</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{teacher.meets}</Typography>

              <Typography color="text.secondary">Встреч на неделе</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">{teacher.students}</Typography>

              <Typography color="text.secondary">Учеников</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Typography variant="h5">Быстрые действия</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/projects">
              <CardContent>
                <Typography>Мои проекты</Typography>

                <Typography color="text.secondary">Управление проектами</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/meets">
              <CardContent>
                <Typography>Встречи</Typography>

                <Typography color="text.secondary">Расписание занятий</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/ideas">
              <CardContent>
                <Typography>Идеи учеников</Typography>

                <Typography color="text.secondary">Новые предложения и заявки</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/ideas/create">
              <CardContent>
                <Typography>Создать идею</Typography>

                <Typography color="text.secondary">Новая идея проекта</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
