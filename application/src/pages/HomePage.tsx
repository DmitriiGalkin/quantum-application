import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../App.css';
import { MeetMap } from '../components/Map/MeetMap.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchIdeas, fetchLike, fetchUnlike } from '../requests.ts';
import Stack from '@mui/material/Stack';
import IdeaCard from '../components/IdeaCard.tsx';
import Page from '../components/Page.tsx';
import { useFilters } from './useFilters.ts';
import Filter from './Filter.tsx';
import CircularProgress from '@mui/material/CircularProgress';

function HomePage() {
  const filters = useFilters();

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideasHome', filters],
    queryFn: () => fetchIdeas(filters.filters),
  });

  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });


  return (
    <Page isError={isIdeasError}>
      <Stack spacing={2}>
        {!(filters.filters.when === undefined && !ideas.length) && <Filter {...filters} />}

        {isIdeasLoading && (
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

        {filters.filters.view === 'map' && (
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

        {filters.filters.view === 'module' && (
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
