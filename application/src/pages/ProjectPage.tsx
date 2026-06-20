import { CardHeader, CardActions, Grid, Typography, Card, CardContent, Avatar, Button, Stack } from '@mui/material';
import { Feed } from '../components/Feed.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../requests.ts';
import { useNavigate, useParams } from 'react-router-dom';
import Page from '../components/Page.tsx';
import CardMedia from '@mui/material/CardMedia';
import ProjectMeetCard from '../components/ProjectMeetCard.tsx';
import Box from '@mui/material/Box';
import { useAuth } from '../providers/AuthProvider.tsx';
import LinkIcon from '@mui/icons-material/Link';
import IconButton from '@mui/material/IconButton';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  if (!project) return null;

  const now = new Date();
  const isMember = project.users.some(u => u.id === user?.id);

  const sortedMeets = [...project.meets].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const nextMeet = sortedMeets.find(m => new Date(m.startedAt) > now);

  return (
    <Page>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader
              avatar={
                <Avatar alt={project?.passport?.title} src={project?.passport?.image || ''}>
                  R
                </Avatar>
              }
              title={project?.passport?.title}
              subheader="Программист трудоголик"
            />

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
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover .idea-link-icon': {
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {project.idea.title}

                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation(); // важно: чтобы не триггерить Card click
                      navigate(`/idea/${project.idea.id}`);
                    }}
                    sx={{
                      opacity: 0.5,
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Typography>
              <Typography color="text.secondary">{project.idea.description}</Typography>
            </CardContent>
            <Box sx={{ p: 2 }}>
              {!isMember && (
                <>
                  <Typography variant="h6">Вступите в проект</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Чтобы участвовать во встречах
                  </Typography>

                  <Button fullWidth variant="contained" sx={{ mt: 2 }}>
                    Вступить
                  </Button>
                </>
              )}

              {isMember && nextMeet && (
                <>
                  <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Ближайшая встреча
                    </Typography>
                    <ProjectMeetCard meet={nextMeet} />
                  </Box>

                  <Button fullWidth variant="contained" color="success" sx={{ mt: 2 }}>
                    Присоединиться к встрече
                  </Button>
                </>
              )}

              {isMember && !nextMeet && (
                <>
                  <Typography variant="h6">Пока нет встреч</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Вы получите уведомление
                  </Typography>

                  <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                    Подписаться
                  </Button>
                </>
              )}
            </Box>
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
