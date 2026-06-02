import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MeetCard from '../components/MeetCard.tsx';
import {createVisit, deleteVisit, fetchProject, generateImage} from '../requests.ts';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import AutoAwesome from "@mui/icons-material/AutoAwesome";

function IdeaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: deleteVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

    const generateImageMutation = useMutation({
        mutationFn: generateImage,
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
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
                <IconButton
                    size="large"
                    edge="start"
                    aria-label="open drawer"
                    sx={{ mr: 2, color: 'white' }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton edge="start" color="inherit" sx={{ color: 'white' }} onClick={() => navigate(`/project/${id}/edit`)}>
                    <EditIcon />
                </IconButton>
            </Toolbar>
        </AppBar>

        <Card
          elevation={0}
          sx={{
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >

            <Box sx={{ position: 'relative', width: '100%' }}>
                <CardMedia
                    component="img"
                    height="360"
                    image={project.image || `/bg.jpeg`}
                    alt={project.title || 'Проект'}
                    sx={{
                        objectFit: 'cover',
                        height: {
                            xs: 220,
                            sm: 360,
                        },
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон для читаемости
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                        boxShadow: 3,
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row',
                    }}
                >
                    {/* Кнопка с иконкой в правом верхнем углу */}
                    {generateImageMutation.isPending && (
                        <Typography className="blink" color="text.secondary" sx={{ paddingLeft: 2 }}>
                            Генерирую...
                        </Typography>
                    )}
                        <IconButton
                            aria-label="Сгенерировать обложку"
                            // Здесь будет обработчик клика на генерацию
                            onClick={e => {
                                e.stopPropagation();
                                generateImageMutation.mutate(project.id);
                            }}
                        >
                            <AutoAwesome fontSize="large" />
                        </IconButton>
                </Box>
            </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  component="h1"
                  variant="h3"
                  sx={{
                    fontSize: {
                      xs: '2rem',
                      sm: '3rem',
                    },
                    fontWeight: 900,
                  }}
                >
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

              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <AvatarGroup max={5}>
                  {(project?.users || []).map(user => (
                    <Avatar src={user.image} alt="Участник" key={user.id} />
                  ))}
                </AvatarGroup>

                <Chip label="+5 участников" color="primary" variant="outlined" />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >

                  {project?.passport && (
                      <Paper
                          elevation={0}
                          sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                          }}
                      >
                          <Typography variant="body2" color="text.secondary">
                              Учитель
                          </Typography>
                          <Typography sx={{ fontWeight: 800 }}>{project?.passport?.title}</Typography>
                      </Paper>
                  )}

              </Box>

                {project?.meets.length > 0 && (
                    <Box component="section">
                        <Typography component="h2" variant="h4" sx={{ mb: 2.5, fontWeight: 900 }}>
                            Расписание
                        </Typography>
                        <Stack spacing={2}>
                            {(project?.meets || [])
                                .filter(meeting => !meeting.deletedAt)
                                .map(meeting => (
                                    <MeetCard
                                        meeting={meeting}
                                        key={meeting.id}
                                        isVisitActionPending={
                                            createVisitMutation.isPending || deleteVisitMutation.isPending
                                        }
                                        onCreateVisit={meetId => createVisitMutation.mutate(meetId)}
                                        onDeleteVisit={visitId => deleteVisitMutation.mutate(visitId)}
                                    />
                                ))}
                        </Stack>{' '}
                    </Box>
                )}
            </Stack>
          </CardContent>
        </Card>
    </Box>
  );
}

export default IdeaPage;
