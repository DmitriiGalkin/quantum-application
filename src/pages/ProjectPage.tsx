import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Feed } from '../features/feed/Feed.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchPlace, fetchProject } from '../requests.ts';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getBrowser } from '../shared/lib/browser.ts';
import { useAuth } from 'providers/auth-context.ts';
import ProjectCard from '../features/project/ui/ProjectCard.tsx';
import Paper from '@mui/material/Paper';
import UserCard from '../features/user/UserCard.tsx';
import CreateMeet from '../features/meets/CreateMeet.tsx';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { role, passport } = useAuth();
  const { hash } = useLocation();

  const { data: project, refetch } = useQuery({
    queryKey: ['project', id, role],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  const { data: place } = useQuery({
    queryKey: ['place', project?.place.id],
    queryFn: () => fetchPlace(project?.place.id || 0),
    enabled: Boolean(project?.place.id),
  });
  useEffect(() => {
    if (project && place && /^#meet-\d+$/.test(hash)) getBrowser()?.document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [project, place, hash]);





  if (!project || !place) return null;


  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <ProjectCard project={project} refetch={refetch} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Feed items={project?.feeds || []} passport={project.passport} refetch={refetch} />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: { xs: 'block', md: 'none' } }}>
          Дополнительно
        </Typography>

        <Stack spacing={2}>
          {role === 'teacher' && project.passport.id === passport?.id && (
            <Paper sx={{ p: 2 }}>
              <CreateMeet projectId={project.id} placeId={project.place.id} locationId={project.locationId} schedule={place.schedule || []} refetch={refetch} />
            </Paper>
          )}

          {Boolean(project.users.length) && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">Участники проекта</Typography>

                <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                  {project.users.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </Stack>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  {project.users.length} участников
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
