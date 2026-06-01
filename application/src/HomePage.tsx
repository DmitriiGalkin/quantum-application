import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuIcon from '@mui/icons-material/Menu';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from './ProjectCard';
import './App.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import {fetchCreateChat, fetchPassport, fetchProjects, type Type} from './requests.ts';
import {
    ACCESS_TOKEN_STORAGE_KEY,
    saveAccessTokenFromUrl,
    strategies, useTarget
} from "./helper.ts";

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';



function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [type, setType] = useState<Type>(null);

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

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  const currentUser = passport?.users?.[0];

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', type],
    queryFn: () => fetchProjects(type, 1),
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

      {accessToken && (
        <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={currentUser?.image || undefined}
                  alt={currentUser?.title || 'Пользователь'}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {currentUser?.title || 'Пользователь'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.age ? `${currentUser.age} лет` : 'Возраст не указан'}
                  </Typography>
                </Box>
              </Stack>

              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to="/chat?target=idea"
                  onClick={() => {
                    localStorage.removeItem('active_chat_id');
                  }}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новая идея" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/chat?target=user"
                  onClick={() => {
                    localStorage.removeItem('active_chat_id');
                  }}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новый ребенок" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setType('self');
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои проекты и идеи" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Календарь" />
                </ListItemButton>
              </List>
            </Stack>

            <Box sx={{ mt: 'auto' }}>
              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to="/project/create"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <CreateNewFolderIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новый проект" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои проекты" />
                </ListItemButton>

                {accessToken && (
                  <ListItemButton
                    component={Link}
                    to="/"
                    onClick={() => {
                      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                      localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
                      setAccessToken(null);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <KeyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Выйти" />
                  </ListItemButton>
                )}
              </List>
            </Box>
          </Box>
        </Drawer>
      )}

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
