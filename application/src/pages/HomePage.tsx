import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../App.css';
import { MeetMap } from '../components/Map/MeetMap.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchIdeas, fetchLike, fetchUnlike } from '../requests.ts';
import Stack from '@mui/material/Stack';
import IdeaCard from '../components/cards/IdeaCard.tsx';
import Page from '../components/Page.tsx';
import { useFilters } from './useFilters.ts';
import Filter from './Filter.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation } from './useLocation.ts';
import Typography from '@mui/material/Typography';

function HomePage() {
  const { filters, setView, setSort, setWhen } = useFilters();
  const location = useLocation(filters.sort === 'nearby');

  const {
    data: ideas = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ideas', filters, location],
    queryFn: () =>
      fetchIdeas({
        ...filters,
        latitude: location.status === 'success' ? location.lat : undefined,
        longitude: location.status === 'success' ? location.lng : undefined,
      }),
    enabled: filters.sort !== 'nearby' || location.status === 'success',
  });

  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });

  return (
    <Page isError={isError}>
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
          <Typography color="text.secondary">Не удалось определить местоположение</Typography>
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

        {filters.view === 'module' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            {ideas.map(idea => (
              <IdeaCard idea={idea} key={idea.id} like={a => mutationLike.mutate(a)} unlike={a => mutationUnlike.mutate(a)} />
            ))}
          </Box>
        )}
      </Stack>
    </Page>
  );
}

export default HomePage;
