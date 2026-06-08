import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ProjectForm, { type ProjectFormValues } from '../ProjectForm.tsx';
import { fetchProject, updateProject } from '../requests.ts';
import type { ProjectDto } from '@shared/types';

function toFormValues(project: ProjectDto): ProjectFormValues {
  return {
    title: project.title ?? '',
    description: project.description ?? '',
  };
}

function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const projectId = id ? Number(id) : null;

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(String(projectId)),
    enabled: projectId !== null && !Number.isNaN(projectId),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => {
      if (!projectId) {
        throw new Error('Не удалось определить номер проекта.');
      }

      return updateProject(projectId, values);
    },
    onMutate: () => {
      setSubmitError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      navigate(`/project/${projectId}`);
    },
    onError: () => {
      setSubmitError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    },
  });

  function handleSubmit(values: ProjectFormValues) {
    updateProjectMutation.mutate(values);
  }

  if (!projectId || Number.isNaN(projectId)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Некорректный номер проекта.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack component="header" direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <IconButton type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowBackIcon />
          </IconButton>

          <Typography component="h1" variant="h4" sx={{ fontWeight: 900 }}>
            Редактирование проекта
          </Typography>
        </Stack>

        {isLoading && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <CircularProgress size={24} />
            <Typography>Загрузка проекта...</Typography>
          </Stack>
        )}

        {isError && <Alert severity="error">Не удалось загрузить проект.</Alert>}

        {project && (
          <ProjectForm
            key={project.id}
            initialValues={toFormValues(project)}
            submitButtonText="Сохранить изменения"
            submittingButtonText="Сохраняем..."
            placeSelectPath={`/project/${project.id}/edit/place`}
            isSubmitting={updateProjectMutation.isPending}
            submitError={submitError}
            onSubmit={handleSubmit}
            placeInfo={
              project.place ? (
                <>
                  {project.place.title && (
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>{project.place.title}</Typography>
                  )}

                  {project.place.address && (
                    <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                      {project.place.address}
                    </Typography>
                  )}

                  {project.place.description && (
                    <Typography>{project.place.description}</Typography>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">Место пока не выбрано.</Typography>
              )
            }
            extraContent={
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Typography component="h2" variant="h5" sx={{ fontWeight: 900 }}>
                      Участники
                    </Typography>

                    {project.users?.length ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            sm: 'repeat(4, minmax(0, 1fr))',
                          },
                          gap: 2,
                        }}
                      >
                        {project.users.map(user => (
                          <Paper
                            component="article"
                            elevation={0}
                            key={user.id}
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                            }}
                          >
                            <Avatar
                              src={user.image ?? undefined}
                              alt={user.title ?? 'Участник'}
                              sx={{
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 1,
                              }}
                            />

                            <Typography sx={{ fontWeight: 800 }}>
                              {user.title ?? 'Без имени'}
                            </Typography>

                            {user.age !== null && user.age !== undefined && (
                              <Typography variant="body2" color="text.secondary">
                                {user.age} лет
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">Пока нет участников.</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            }
          />
        )}
      </Container>
    </Box>
  );
}

export default EditProjectPage;
