import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MeetCard from '../components/MeetCard.tsx';
import { createMeetUser, deleteMeetUser, fetchProject } from '../requests.ts';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import UserGroup from '../components/UserGroup.tsx';
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Tooltip from '@mui/material/Tooltip';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '../providers/AuthProvider.tsx';

function ProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const createMeetUserMutation = useMutation({
    mutationFn: createMeetUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const deleteMeetUserMutation = useMutation({
    mutationFn: deleteMeetUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: project?.title,
        text: project?.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  useEffect(() => {
    document.title = project?.title || 'Проект';
  }, [project?.title]);

  if (!id) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Не указан id проекта.</Alert>
      </Container>
    );
  }

  if (isProjectLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress size={24} />
          <Typography>Загрузка проекта...</Typography>
        </Stack>
      </Container>
    );
  }

  if (isProjectError || !project) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Не удалось загрузить проект.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to bottom, #FFB628, #FF8F28)',
        }}
      >
        <Toolbar>
          <IconButton size="large" edge="start" aria-label="open drawer" sx={{ mr: 2, color: 'white' }} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />

          {/* SHARE */}
          <Tooltip title="Поделиться">
            <IconButton onClick={handleShare} sx={{ color: 'white' }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <IconButton color="inherit" sx={{ color: 'white' }} onClick={() => navigate(`/project/${id}/edit`)}>
            <EditIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 4,
              }}
            >
              <CardMedia
                component="img"
                image={`/bg.jpeg`}
                alt={project.title || 'Проект'}
                sx={{
                  objectFit: 'cover',
                  height: {
                    xs: 90,
                    sm: 120,
                  },
                }}
              />

              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography component="h4" variant="h4">
                      {project.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 1.5,
                        fontSize: {
                          xs: '1rem',
                          sm: '1.1rem',
                        },
                        lineHeight: 1.7,
                      }}
                    >
                      {project.description}
                    </Typography>
                  </Box>

                  <UserGroup users={project.users || []} />

                  {project?.passport && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Stack spacing={2} direction="row">
                        <Avatar
                          src={project?.passport?.image || undefined}
                          alt={project?.passport?.title || 'Учитель'}
                          sx={{ width: 56, height: 56 }}
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Учитель
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>{project?.passport?.title}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            {Boolean(project?.meets) && (
              <Box component="section">
                <Typography component="h6" variant="h6" sx={{ pt: 2, mb: { xs: 2, md: 3 }, fontWeight: 900, color: 'white' }}>
                  Расписание
                </Typography>
                <Stack spacing={2}>
                  {(project?.meets || []).map(meet => (
                    <MeetCard
                      meet={meet}
                      key={meet.id}
                      isMeetUserActionPending={createMeetUserMutation.isPending || deleteMeetUserMutation.isPending}
                      onCreateMeetUser={user ? meetId => createMeetUserMutation.mutate({ meetId, userId: user.id }) : undefined}
                      onDeleteMeetUser={meetUserId => {
                        deleteMeetUserMutation.mutate(meetUserId);
                      }}
                    />
                  ))}
                </Stack>{' '}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProjectPage;
