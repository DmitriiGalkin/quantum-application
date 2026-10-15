import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets, fetchUserDashboard } from '../../requests.ts';
import Projects from '../../features/project/ui/Projects.tsx';
import MeetCard from '../../features/meets/MeetCard.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';
import { useAuth } from '../../providers/auth-context.ts';
import FamilyAccess from '../../features/user/FamilyAccess.tsx';
import { userMeetSections } from '../../features/user/user-meet-sections.ts';

export default function UserHomePage() {
  const filter = useFilters({ projects: true, compactViews: true });
  const { passport, userId, role } = useAuth();
  const enabled = role === 'user' && Boolean(userId);
  const projects = useQuery({ queryKey: ['user-dashboard', userId], queryFn: fetchUserDashboard, enabled });
  const meets = useQuery({ queryKey: ['meets', 'user', userId], queryFn: fetchMeets, enabled });
  const next = userMeetSections(meets.data ?? []).upcoming.find(meet => meet.status === 'published');
  const child = passport?.users.find(user => user.id === userId);
  const needsPayment = next && !next.isPaid && next.price !== null && next.price > 0;
  return <FamilyAccess><Stack spacing={3}>
    <Typography component="h1" variant="h4">{child?.title ? `Кабинет · ${child.title}` : 'Семейный кабинет'}</Typography>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}><Stack spacing={2}>
        <Typography component="h2" variant="h5">Ближайшая встреча</Typography>
        {meets.isPending ? <Typography role="status">Загрузка встреч…</Typography>
          : meets.isError ? <Alert severity="error" action={<Button onClick={() => void meets.refetch()}>Повторить</Button>}>Не удалось загрузить встречи.</Alert>
            : next ? <MeetCard meet={next} refetch={() => void meets.refetch()} />
              : <Card><CardContent><Stack spacing={2}><Typography>Ближайших подтверждённых встреч пока нет.</Typography><Button component={Link} to="/" variant="contained">Найти проект для ребёнка</Button></Stack></CardContent></Card>}
      </Stack></Grid>
      <Grid size={{ xs: 12, md: 5 }}><Card><CardContent><Stack spacing={2}>
        <Typography component="h2" variant="h5">Следующий шаг</Typography>
        {meets.isPending ? <Typography role="status">Проверяем расписание…</Typography>
          : meets.isError ? <Typography>Обновите встречи, чтобы увидеть следующий шаг.</Typography>
            : next ? <><Typography>{needsPayment ? 'Участие в ближайшей встрече ещё не оплачено. Проверьте сведения и перейдите к оплате.' : 'Проверьте время и адрес ближайшей встречи.'}</Typography><Button component={Link} variant="contained" to={`/project/${next.projectId}#meet-${next.id}`}>{needsPayment ? 'Проверить участие и оплату' : 'Открыть встречу'}</Button></>
              : <Typography>Выберите проект по интересам ребёнка и запишитесь на подходящую встречу.</Typography>}
        <Button component={Link} to="/user/meets">Все мои встречи</Button>
        {userId && <Button component={Link} to={`/users/${userId}`}>Профиль ребёнка</Button>}
      </Stack></CardContent></Card></Grid>
    </Grid>
    {projects.isPending ? <Typography role="status">Загрузка проектов…</Typography>
      : projects.isError ? <Alert severity="error" action={<Button onClick={() => void projects.refetch()}>Повторить</Button>}>Не удалось загрузить проекты.</Alert>
        : <Projects title="Мои проекты" filter={filter} projects={projects.data?.projects ?? []} refetch={() => void projects.refetch()} preserveOrder withoutIdea
          emptyText="У ребёнка пока нет проектов. Начните с выбора проекта в каталоге." />}
  </Stack></FamilyAccess>;
}
