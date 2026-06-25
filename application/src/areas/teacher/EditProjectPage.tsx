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
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../../requests.ts';

function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();


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

        {project?.place ? (
          <>
            {project.place.title && <Typography sx={{ fontWeight: 900, mb: 1 }}>{project.place.title}</Typography>}

            {project.place.address && <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{project.place.address}</Typography>}

            {project.place.description && <Typography>{project.place.description}</Typography>}
          </>
        ) : (
          <Typography sx={{ color: 'text.secondary' }}>Место пока не выбрано.</Typography>
        )}
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

              {project?.users?.length ? (
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

                      <Typography sx={{ fontWeight: 800 }}>{user.title ?? 'Без имени'}</Typography>

                      {user.age !== null && user.age !== undefined && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.age} лет
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>Пока нет участников.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default EditProjectPage;
