import { useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ProjectCard from '../components/ProjectCard.tsx';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects, type Type, usePassport } from '../requests.ts';
import Header from '../components/Header.tsx';


function ProjectsPage() {
    const passport = usePassport()
    const [searchParams] = useSearchParams();

    // Получаем значение параметра 'target'
    const variant = searchParams.get('variant'); // Результат: "idea"

    const {
        data: projects = [],
        isLoading: isProjectsLoading,
        isError: isProjectsError,
    } = useQuery({
        queryKey: ['projects', variant, passport?.users?.[0]?.id],
        queryFn: () => fetchProjects(variant as Type, passport?.users?.[0]?.id || 0),
    });

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box component="section">
          {isProjectsLoading && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <CircularProgress size={24} />
              <Typography>Загрузка проектов...</Typography>
            </Stack>
          )}

          {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

          {!isProjectsLoading && !isProjectsError && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
              }}
            >
              {projects.map(project => (
                <ProjectCard project={project} key={project.id} />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default ProjectsPage;
