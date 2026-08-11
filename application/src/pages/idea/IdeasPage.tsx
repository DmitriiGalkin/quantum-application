import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../../App.css';
import { MeetMap } from '../../features/place/MeetMap.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas } from '../../requests.ts';
import Stack from '@mui/material/Stack';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';
import Filter from '../../features/idea/ui/Filter.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation } from '../../shared/lib/useLocation.ts';
import Typography from '@mui/material/Typography';
import IdeaGrids from '../../features/idea/ui/IdeaGrids.tsx';

function IdeasPage() {
  const { filters, setView, setSort, setWhen } = useFilters();
  const location = useLocation(filters.sort === 'nearby');

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas', filters, location],
    queryFn: () =>
      fetchIdeas({
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
      {/*{activeContext.role === 'guest' && <AIIdeaBanner />}*/}

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
      {filters.view === 'map' && (
        <Paper
          component="section"
          elevation={1}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
          aria-labelledby="auth-section-title"
        >
          <MeetMap lat={55.75} lng={37.62} zoom={12} />
        </Paper>
      )}
      {filters.view === 'module' && <IdeaGrids ideas={ideas} />}
    </Stack>
  );
}

export default IdeasPage;
