import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../App.css';
import { saveAccessTokenFromUrl, strategies } from '../helper.ts';
import Header from '../components/Header.tsx';
import { MapComponent } from '../components/MeetMap.tsx';


function HomePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const initialAccessToken = saveAccessTokenFromUrl();

  useEffect(() => {
    if (!accessToken && initialAccessToken) {
      window.requestAnimationFrame(() => {
        setAccessToken(initialAccessToken);
      });
    }
  }, [accessToken, initialAccessToken]);

  // @ts-ignore
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Typography sx={{ fontWeight: 800 }}>Добро пожаловать на страницу нашего проекта</Typography>
        <MapComponent lat={55.75} lng={37.62} zoom={12} />
        {!accessToken ? (
          <Paper
            component="section"
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 4,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
            }}
            aria-labelledby="auth-section-title"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800 }} id="auth-section-title" variant="h5">
                  Войти в 244221111
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Выберите удобный способ авторизации
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {strategies.map(strategy => (
                  <Button component="a" variant="contained" href={strategy.href} key={strategy.title} sx={{ minWidth: 120 }}>
                    <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
                      {strategy.icon}
                    </Box>
                    {strategy.title}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Box>Здравствуйте, вы у нас не впервые</Box>
        )}
      </Container>
    </Box>
  );
}

export default HomePage;
