import { Avatar, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Feed } from '../features/feed/ui/Feed.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchCreateMeet, fetchProject } from '../requests.ts';
import { useParams } from 'react-router-dom';
import Page from '../shared/ui/Page.tsx';
import Project from '../features/projects/ui/Project.tsx';
import { CreateMeetForm } from '../features/meets/ui/CreateMeetForm.tsx';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });
  const createMeetMutation = useMutation({
    mutationFn: fetchCreateMeet,
  });

  if (!project) return null;

  return (
    <Page>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Project project={project} refetch={refetch} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CreateMeetForm
            projectId={project.id}
            placeId={project.place.id}
            onSubmit={data => {
              createMeetMutation.mutate(data, {
                onSuccess: () => {
                  refetch();
                },
              });
            }}
          />

          <Feed items={project.feeds || []} passport={project.passport} refetch={refetch} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
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
    </Page>
  );
}
