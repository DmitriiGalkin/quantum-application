import { Avatar, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Feed } from '../../features/feed/ui/Feed.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchCreateMeet, fetchProject } from '../../requests.ts';
import { useParams } from 'react-router-dom';
import Project from '../../features/project/ui/Project.tsx';
import { type CreateMeet, CreateMeetForm } from '../../features/meets/ui/CreateMeetForm.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { activeContext, passport } = useAuth();
  const role = activeContext.role;

  const { data: project, refetch } = useQuery({
    queryKey: ['project', id, activeContext],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  const createMeetMutation = useMutation({
    mutationFn: fetchCreateMeet,
  });

  const onCreateMeet = (data: CreateMeet) => {
    createMeetMutation.mutate(data, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (!project) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Project project={project} refetch={refetch} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          {role === 'teacher' && <CreateMeetForm projectId={project.id} placeId={project.place.id} onSubmit={onCreateMeet} />}

          <Feed items={project?.feeds || []} passport={project.passport} refetch={refetch} />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: { xs: 'block', md: 'none' } }}>
          Дополнительно
        </Typography>

        {Boolean(project.users.length) ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">Участники</Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {project.users.map(project => (
                  <Avatar key={project.id} src={project.image ? project.image : undefined}>
                    {project.title[0]}
                  </Avatar>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {project.users.length} участников
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <div>Хей куратор, нажми кнопку поделиться своим проектом в соц сети</div>
        )}
      </Grid>
    </Grid>
  );
}
