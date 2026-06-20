import { CardHeader, CardActions, Grid, Typography, Card, CardContent, Avatar, Button, Stack } from '@mui/material';
import { Feed } from '../components/Feed.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../requests.ts';
import { useParams } from 'react-router-dom';
import Page from '../components/Page.tsx';
import CardMedia from '@mui/material/CardMedia';
import ProjectMeetCard from '../components/ProjectMeetCard.tsx';
import Box from '@mui/material/Box';
import {useAuth} from "../providers/AuthProvider.tsx";

export default function ProjectPage() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  if (!project) return null;

  const isMember = project.users.some(u => u.id === user?.id);

  const now = new Date();

  const sortedMeets = [...project.meets].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const nextMeet = sortedMeets.find(m => new Date(m.startedAt) > now);

  return (
    <Page>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardHeader
              avatar={
                <Avatar alt={project?.passport?.title} src={project?.passport?.image || ''}>
                  R
                </Avatar>
              }
              title={project?.passport?.title}
              subheader="Программист трудоголик"
            />
            <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
              <Typography variant="caption" color="text.secondary">
                Ближайшая встреча
              </Typography>
              <ProjectMeetCard meet={nextMeet} />
            </Box>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained">Присоединиться</Button>
                  <Button variant="outlined">❤️</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3 }}>
            <CardMedia
              component="img"
              height="360"
              image={project.idea.image || `/bg.jpeg`}
              alt={project.idea.title || 'Проект'}
              sx={{
                objectFit: 'cover',
                height: {
                  xs: 220,
                  sm: 360,
                },
              }}
            />
            <CardContent>
              <Typography gutterBottom>Идея</Typography>
              <Typography variant="h4" gutterBottom>
                {project.idea.title}
              </Typography>
              <Typography color="text.secondary">{project.idea.description}</Typography>
            </CardContent>
            <CardActions>
              <Button href={`/idea/${project.idea.id}`} size="small">
                Подробнее о идее
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Feed items={project.feeds} />
          </Stack>
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
