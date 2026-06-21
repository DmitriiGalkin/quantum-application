import { Avatar, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Feed } from '../features/feed/ui/Feed.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../requests.ts';
import { useParams } from 'react-router-dom';
import Page from '../shared/ui/Page.tsx';
import Project from '../features/projects/ui/Project.tsx';


export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  if (!project) return null;

  return (
    <Page>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Project project={project} refetch={refetch}/>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Feed items={project.feeds || []} passport={project.passport} refetch={refetch} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">Участники</Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {project.users.map(p => (
                  <Avatar key={p.id}>{p.title[0]}</Avatar>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {project.users.length} участников
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
}
