import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Feed } from '../features/feed/Feed.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchPlace, fetchProject } from '../requests.ts';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBrowser } from '../shared/lib/browser.ts';
import { useAuth } from 'providers/auth-context.ts';
import ProjectCard from '../features/project/ui/ProjectCard.tsx';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ClosableDialogTitle from '../components/ClosableDialogTitle.tsx';
import CreateMeet from '../features/meets/CreateMeet.tsx';
import MeetCard from '../features/meets/MeetCard.tsx';
import { upcomingPublishedMeets } from '../features/project/ui/project-card-meeting.ts';
import type { FeedItem } from 'entities';

export default function ProjectPage() {
  const [planning, setPlanning] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { role, passport } = useAuth();
  const { hash } = useLocation();
  const validId = Number.isSafeInteger(Number(id)) && Number(id) > 0;

  const { data: project, refetch, isPending, isError } = useQuery({
    queryKey: ['project', id, role],
    queryFn: () => fetchProject(id as string),
    enabled: validId,
  });
  const canCreateMeet = role === 'teacher' && project?.passport.id === passport?.id;
  const place = useQuery({
    queryKey: ['place', project?.place.id],
    queryFn: () => fetchPlace(project?.place.id || 0),
    enabled: Boolean(project?.place.id) && canCreateMeet,
  });
  useEffect(() => {
    if (project && /^#meet-\d+$/.test(hash)) getBrowser()?.document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [project, hash]);

  if (!validId) return <Alert severity="info">Проект не найден.</Alert>;
  if (isPending) return <Typography role="status">Загрузка проекта…</Typography>;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить проект.</Alert>;
  if (!project) return <Alert severity="info">Проект не найден.</Alert>;
  const upcoming = upcomingPublishedMeets(project.meets);
  const upcomingIds = new Set(upcoming.map(meet => meet.id));
  const history: FeedItem[] = [
    ...project.meets.filter(meet => !upcomingIds.has(meet.id)).map(meet => ({ id: `meet${meet.id}`, type: 'meet' as const, createdAt: meet.startedAt, meet })),
    ...(project.feeds ?? []).filter(item => item.type !== 'meet'),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <ProjectCard project={project} refetch={refetch} detailed />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h5">Ближайшие встречи</Typography>
          {upcoming.length ? upcoming.map(meet => <MeetCard key={meet.id} meet={meet} refetch={refetch} />)
            : <Typography color="text.secondary">{project.kind === 'regular'
              ? 'Запись на ближайшее занятие пока недоступна. Следите за расписанием кружка.'
              : 'Ближайшая встреча пока не назначена.'}</Typography>}
          {canCreateMeet && (
            <>
            <Button variant="contained" onClick={() => setPlanning(true)}>Запланировать встречу</Button>
            <Dialog open={planning} onClose={() => setPlanning(false)} fullWidth maxWidth="md">
              <ClosableDialogTitle onClose={() => setPlanning(false)}>Запланировать встречу</ClosableDialogTitle>
              <DialogContent sx={{ pt: 2 }}>
              {place.isPending ? <Typography role="status">Загрузка расписания центра…</Typography>
                : place.isError ? <Alert severity="error" action={<Button onClick={() => void place.refetch()}>Повторить</Button>}>Не удалось загрузить расписание центра.</Alert>
                  : <CreateMeet projectId={project.id} placeId={project.place.id} locationId={project.locationId} schedule={place.data?.schedule || []} refetch={() => { setPlanning(false); void refetch(); }} />}
              </DialogContent>
            </Dialog>
            </>
          )}

          {Boolean(history.length) && <>
            <Typography component="h2" variant="h5">История проекта и другие встречи</Typography>
            <Feed items={history} passport={project.passport} refetch={refetch} />
          </>}
        </Stack>
      </Grid>
    </Grid>
  );
}
