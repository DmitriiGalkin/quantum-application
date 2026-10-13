import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../requests.ts';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Projects from '../features/project/ui/Projects.tsx';
import { useLocation } from '../shared/lib/useLocation.ts';

function ProjectsPage() {
  const filter = useFilters({ projects: true });
  const { filters } = filter;
  const location = useLocation(filters.sort === 'nearby');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', filters, location],
    queryFn: () =>
      fetchProjects({
        ...filters,
        ...(filters.sort === 'nearby' && location.status === 'success'
          ? {
              latitude: location.lat,
              longitude: location.lng,
            }
          : {}),
      }),
    enabled: filters.sort !== 'nearby' || location.status === 'success' || location.status === 'error',
  });

  return (
    <Stack spacing={2}>

      {(isLoading || (filters.sort === 'nearby' && location.status === 'loading')) && (
        <Box
          sx={{
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}

      {filters.sort === 'nearby' && location.status === 'error' && (
        <Typography sx={{ color: 'text.secondary' }}>Местоположение недоступно. Показываем все проекты.</Typography>
      )}

      <Projects filter={filter} projects={projects} catalog preserveOrder withoutIdea />
    </Stack>
  );
}

export default ProjectsPage;
