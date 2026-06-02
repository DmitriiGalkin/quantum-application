import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import ProjectCard from '../components/ProjectCard.tsx';
import '../App.css';
import {useMutation, useQuery} from '@tanstack/react-query';
import {fetchCreateChat, fetchProjects, type Type, usePassport} from '../requests.ts';
import {saveAccessTokenFromUrl, useTarget} from "../helper.ts";
import HomeDrawer from "../components/HomeDrawer.tsx";

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';


function ProjectsPage() {
  const navigate = useNavigate();
    const passport = usePassport()
    const [searchParams] = useSearchParams();

    // Получаем значение параметра 'target'
    const variant = searchParams.get('variant'); // Результат: "idea"

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
        queryKey: ['projects', variant, passport?.users?.[0]?.id],
        queryFn: () => fetchProjects(variant as Type, passport?.users?.[0]?.id),
    });

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

export default ProjectsPage;
