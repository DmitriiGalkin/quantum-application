import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MessageIcon from '@mui/icons-material/Message';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacher } from '../requests.ts';
import ChatDialog from '../components/ChatDialog';
import Share from '../components/Share.tsx';
import Projects from '../features/project/ui/Projects.tsx';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import IdeaGrids from '../features/idea/ui/IdeaGrids.tsx';
import Title from 'components/Title.tsx';
import PlaceCard from '../features/place/PlaceCard.tsx';
import { useAuth } from '../providers/auth-context.ts';
import { usePostAuthAction } from '../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../shared/lib/useRunPostAuthAction.ts';

export default function TeachersPage() {
  const filter = useFilters({ projects: true, defaultView: 'table' });
  const { id } = useParams<{ id: string }>();
  const teacherId = Number(id);
  const validId = Number.isSafeInteger(teacherId) && teacherId > 0;
  const [chatOpen, setChatOpen] = useState(false);
  const { passport, authHandler } = useAuth();
  const { setAction } = usePostAuthAction();
  useRunPostAuthAction(passport, () => setChatOpen(true), action => action.type === 'teacher-chat' && action.payload?.teacherId === teacherId);
  const handleStartChat = () => {
    if (!passport) {
      setAction({ type: 'teacher-chat', payload: { teacherId } });
      return authHandler();
    }
    setChatOpen(true);
  };
  const { data: teacher, refetch, isLoading, isError } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => fetchTeacher(teacherId),
    enabled: validId,
  });

  if (!validId) return <Typography>Преподаватель не найден.</Typography>;
  if (isLoading) return <Typography role="status">Загрузка преподавателя…</Typography>;
  if (isError) return <Stack spacing={2}><Typography role="alert">Не удалось загрузить преподавателя.</Typography><Button onClick={() => void refetch()}>Повторить запрос</Button></Stack>;
  if (!teacher) return <Typography>Преподаватель не найден.</Typography>;

  const centers = [...new Map(teacher.centers.map(place => [place.id, place])).values()];

  return <Stack spacing={3}>
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Avatar src={teacher.passport.image || undefined} alt={teacher.passport.title} variant="rounded" sx={{ width: 160, height: 160 }}>{teacher.passport.title?.[0]}</Avatar>
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <Typography component="h1" variant="h4">{teacher.passport.title}</Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-line' }}>{teacher.passport.description}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
              {passport?.id !== teacher.passport.id && <Button variant="contained" startIcon={<MessageIcon />} onClick={handleStartChat}>Написать</Button>}
              <Share title={teacher.passport.title} description={teacher.passport.description || ''} />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>

    <Stack component="section" spacing={2}>
      <Title text="Центры работы" />
      {centers.length ? <Grid container spacing={2}>
        {centers.map(place => <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={place.id}><PlaceCard place={place} /></Grid>)}
      </Grid> : <Typography color="text.secondary">Центры работы пока не указаны.</Typography>}
    </Stack>

    <Projects title="Проекты учителя" filter={filter} projects={teacher.projects} refetch={refetch} withoutIdea />
    <Typography variant="body2" color="text.secondary">Проекты: {teacher.projects.length} · Встречи: {teacher.meets} · Центры: {teacher.centersCount}</Typography>
    {!!teacher.ideas.length && <Stack component="section" spacing={2}>
      <Title text="Идеи учителя" />
      <IdeaGrids ideas={teacher.ideas} />
    </Stack>}
    <ChatDialog open={chatOpen} teacherId={teacher.passport.id} onClose={() => setChatOpen(false)} />
  </Stack>;
}
