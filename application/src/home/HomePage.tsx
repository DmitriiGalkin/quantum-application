import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import ProjectCard from '../components/ProjectCard.tsx';
import '../App.css';
import {useMutation, useQuery} from '@tanstack/react-query';
import {fetchCreateChat, fetchIdeas, fetchProjects} from '../requests.ts';
import {saveAccessTokenFromUrl, strategies, useTarget} from "../helper.ts";
import HomeDrawer from "./HomeDrawer.tsx";
import IdeaCard from "../components/IdeaCard.tsx";

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';


function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const initialAccessToken = saveAccessTokenFromUrl();
  const target = useTarget();


  const mutation = useMutation({
    mutationFn: fetchCreateChat,
  });

  useEffect(() => {
    if (!accessToken && initialAccessToken) {
      window.requestAnimationFrame(() => {
        setAccessToken(initialAccessToken);
      });
    }
  }, [accessToken, initialAccessToken]);

    const {
        data: projects = [],
        isLoading: isProjectsLoading,
        isError: isProjectsError,
    } = useQuery({
        queryKey: ['projects', 'self'],
        queryFn: () => fetchProjects('projects', 1),
    });

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => fetchIdeas(1),
  });

  // @ts-ignore
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to bottom, #FFB628, #FF8F28)',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="open drawer"
            sx={{ mr: 2, color: 'white' }}
            onClick={() => setIsMenuOpen(currentValue => !currentValue)}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              color: 'white',
              flexGrow: 1,
            }}
          >
            Quantum
          </Typography>
          <IconButton
            color="primary"
            aria-label="Идеи от АИ"
            sx={{ color: 'white' }}
            onClick={() => {
              const activeChatId = localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);

              if (activeChatId) {
                return navigate(`/chat/${activeChatId}`);
              }

              mutation.mutate(
                { target: target || 'none' },
                {
                  onSuccess: chatId => {
                      localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, String(chatId));
                    navigate(`/chat/${chatId}`);
                  },
                  onError: error => {
                    console.error('Ошибка отправки:', error);
                    alert('Не удалось создать чат. Попробуйте ещё раз.');
                  },
                },
              );
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {accessToken && <HomeDrawer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!accessToken && (
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
                  <Button
                    component="a"
                    variant="contained"
                    href={strategy.href}
                    key={strategy.title}
                    sx={{ minWidth: 120 }}
                  >
                    <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
                      {strategy.icon}
                    </Box>
                    {strategy.title}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        )}
          <Box component="section">
              <Typography sx={{ fontWeight: 900, mb: 3 }} variant="h4">
                  Идеи
              </Typography>

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
                          gap: 3,
                      }}
                  >
                      {ideas.map(idea => (
                          <IdeaCard idea={idea} key={idea.id} />
                      ))}
                  </Box>
              )}
          </Box>

        <Box component="section">
          <Typography sx={{ fontWeight: 900, mb: 3 }} variant="h4">
            Проекты
          </Typography>

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

export default HomePage;
