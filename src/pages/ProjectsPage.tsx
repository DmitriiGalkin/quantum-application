import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../requests.ts';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import Filter from '../features/idea/ui/Filter.tsx';
import ProjectGrids from '../features/project/ui/ProjectGrids.tsx';
import { useLocation } from '../shared/lib/useLocation.ts';
import ProjectGroups from '../features/project/ui/ProjectGroups.tsx';

function ProjectsPage() {
  const { filters, setView, setSort, setWhen } = useFilters();
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
    enabled: filters.sort !== 'nearby' || location.status === 'success',
  });

  return (
    <Stack spacing={2}>
      <Filter filters={filters} setView={setView} setSort={setSort} setWhen={setWhen} />

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
        <Typography sx={{ color: 'text.secondary' }}>Не удалось определить местоположение</Typography>
      )}

      {filters.view === 'module' && <ProjectGrids projects={projects} />}

      {filters.view === 'group' && <ProjectGroups projects={projects} withoutIdea />}
    </Stack>
  );
}

export default ProjectsPage;