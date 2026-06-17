import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../App.css';
import { MeetMap } from '../components/Map/MeetMap.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchIdeas, fetchLike, fetchUnlike } from '../requests.ts';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IdeaCard from '../components/IdeaCard.tsx';
import Page from '../components/Page.tsx';

function HomePage() {
  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideasHome'],
    queryFn: () => fetchIdeas(),
  });

  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });

  return (
    <Page>
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

      <Box component="section">
        {isIdeasLoading && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <CircularProgress size={24} />
            <Typography>Загрузка идей...</Typography>
          </Stack>
        )}

        {isIdeasError && <Alert severity="error">Не удалось загрузить идеи.</Alert>}

        {!isIdeasLoading && !isIdeasError && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {ideas.map(idea => (
              <IdeaCard idea={idea} key={idea.id} like={a => mutationLike.mutate(a)} unlike={a => mutationUnlike.mutate(a)} />
            ))}
          </Box>
        )}
      </Box>
    </Page>
  );
}

export default HomePage;
