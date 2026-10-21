import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherDashboard } from '../../requests.ts';
import MeetGrids from '../../features/meets/MeetGrids.tsx';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { upcomingPublishedMeets } from '../../features/project/ui/project-card-meeting.ts';

export default function TeacherDashboardPage() {
  const { data, refetch, isPending, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: fetchTeacherDashboard,
  });

  if (isPending) return <Typography role="status">Загрузка кабинета преподавателя…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить кабинет преподавателя.</Alert>;
  if (!data) return <Typography>Сведения о кабинете пока недоступны.</Typography>;
  const upcoming = upcomingPublishedMeets(data.bmeets);
  const pending = data.bmeets.filter(meet => meet.status === 'pending' && !meet.deletedAt).length;

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4" sx={{ color: 'text.primary' }}>
        Кабинет учителя
      </Typography>
      {pending > 0 && <Alert severity="info" action={<Button component={Link} to="/teacher/meets">Открыть</Button>}>Ожидают подтверждения центра: {pending} встреч.</Alert>}
      <Typography component="h2" variant="h5">Ближайшие встречи</Typography>
      {upcoming.length ? <MeetGrids meets={upcoming} refetch={refetch} />
        : <Typography>Ближайших подтверждённых встреч пока нет. Откройте проект, чтобы запланировать встречу.</Typography>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: data.debit === null ? 4 : 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/projects" aria-label={`Мои проекты: ${data.projects}`}>
              <CardContent>
              <Typography variant="h4">{data.projects}</Typography>

              <Typography color="text.secondary">Проектов</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: data.debit === null ? 4 : 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/meets" aria-label={`Мои встречи: ${data.meets}`}>
              <CardContent>
              <Typography variant="h4">{data.meets}</Typography>

              <Typography color="text.secondary">Встреч</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: data.debit === null ? 4 : 3 }}>
          <Card>
            <CardActionArea component={Link} to="/teacher/projects" aria-label={`Ученики в проектах: ${data.students}`}>
              <CardContent>
              <Typography variant="h4">{data.students}</Typography>

              <Typography color="text.secondary">Учеников в проектах</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {data.debit !== null && (
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardActionArea component={Link} to="/teacher/meets" aria-label={`Доход от встреч: ${data.debit} рублей`}>
                <CardContent>
                <Typography variant="h4">{data.debit} рублей</Typography>

                <Typography color="text.secondary">Доход</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )}
      </Grid>

    </Stack>
  );
}
