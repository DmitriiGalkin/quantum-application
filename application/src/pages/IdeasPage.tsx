import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas, usePassport } from '../requests.ts';
import IdeaCard from '../components/IdeaCard.tsx';
import Header from '../components/Header.tsx';


function IdeasPage() {
  const passport = usePassport()

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideas', passport?.users?.[0]?.id],
    queryFn: () => fetchIdeas({ variant: 'self', userId: passport?.users?.[0]?.id || 0 }),
  });

  // @ts-ignore
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 2 }}>
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

export default IdeasPage;
