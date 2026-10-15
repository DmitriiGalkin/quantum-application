import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherIdeas } from '../../requests.ts';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { moscowFormat } from '../../features/meets/moscow-time.ts';

export default function TeacherUserIdeasPage() {
  const { data: allIdeas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-ideas'],
    queryFn: fetchTeacherIdeas,
  });
  const ideas = allIdeas.filter(idea => Boolean(idea.user));

  if (isLoading) {
    return <Typography role="status">Загрузка идей учеников…</Typography>;
  }

  return (
      <Stack spacing={2}>
        <Typography variant="h4">Идеи учеников</Typography>
        <Typography color="text.secondary">Доступные вам идеи с указанным учеником. Общая библиотека доступна отдельно.</Typography>
        {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
        {!isError && !ideas.length && <Typography>Идей с указанным учеником пока нет.</Typography>}
        <Button component={Link} to="/ideas" sx={{ alignSelf: 'flex-start' }}>Библиотека идей</Button>

        {ideas.map(idea => (
          <Card key={idea.id}>
            <CardContent>
              <Typography component={Link} to={`/idea/${idea.id}`} sx={{ overflowWrap: 'anywhere' }}>{idea.title}</Typography>

              <Typography color="text.secondary">
                {idea.user?.title} · {Number.isFinite(new Date(idea.createdAt).getTime()) ? moscowFormat(idea.createdAt, { dateStyle: 'medium' }) : 'Дата не указана'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
  );
}
