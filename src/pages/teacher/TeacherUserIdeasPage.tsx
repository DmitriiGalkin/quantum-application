import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherIdeas } from '../../requests.ts';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';

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
        <Typography color="text.secondary">Идеи ваших учеников. Дата создания не подтверждает актуальность интереса; наличие связанного проекта не означает, что идея выполнена.</Typography>
        {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
        {!isError && !ideas.length && <Typography>Идей с указанным учеником пока нет.</Typography>}
        <Button component={Link} to="/ideas" sx={{ alignSelf: 'flex-start' }}>Библиотека идей</Button>

        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </Stack>
  );
}
