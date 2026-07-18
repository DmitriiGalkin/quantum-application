import { Avatar, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Feed } from '../../features/feed/Feed.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchCreateMeet, fetchProject } from '../../requests.ts';
import { useParams } from 'react-router-dom';
import { type CreateMeet, CreateMeetForm } from '../../features/meets/ui/CreateMeetForm.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import ProjectCard from '../../features/project/ProjectCard.tsx';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { activeContext } = useAuth();
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
          {role === 'teacher' && <CreateMeetForm projectId={project.id} placeId={project.place.id} onSubmit={onCreateMeet} />}

          {Boolean(project.users.length) && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">Участники проекта</Typography>

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
          )}

          {activeContext.role === 'teacher' && <div>Хей куратор, нажми кнопку поделиться своим проектом в соц сети</div>}
        </Stack>
      </Grid>
    </Grid>
  );
}
