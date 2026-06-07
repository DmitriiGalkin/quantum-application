import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import '../App.css';
import Header from '../components/Header.tsx';
import { MapComponent } from '../components/MeetMap.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas } from '../requests.ts';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IdeaCard from '../components/IdeaCard.tsx';


function HomePage() {

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => fetchIdeas(null),
  });

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
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
          <MapComponent lat={55.75} lng={37.62} zoom={12} />
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
                },
                gap: 2,
              }}
            >
              {ideas.map(idea => (
                <IdeaCard idea={idea} key={idea.id} />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
