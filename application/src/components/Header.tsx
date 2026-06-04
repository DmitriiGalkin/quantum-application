import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateChat } from '../requests.ts';
import { saveAccessTokenFromUrl, strategies, useTarget } from '../helper.ts';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import HomeDrawer from '../components/HomeDrawer.tsx';
import { Link, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const target = useTarget();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const initialAccessToken = saveAccessTokenFromUrl();

  useEffect(() => {
    if (!accessToken && initialAccessToken) {
      window.requestAnimationFrame(() => {
        setAccessToken(initialAccessToken);
      });
    }
  }, [accessToken, initialAccessToken]);


  const mutation = useMutation({
    mutationFn: fetchCreateChat,
  });

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to bottom, #FFB628, #FF8F28)',
        }}
      >
        <Toolbar>
          {accessToken && (
            <IconButton
              size="large"
              edge="start"
              aria-label="open drawer"
              sx={{ mr: 2, color: 'white' }}
              onClick={() => setIsMenuOpen(currentValue => !currentValue)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Link to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'white',
              }}
            >
              Quantum
            </Typography>
          </Link>

          {!accessToken && (
            <IconButton
              color="primary"
              aria-label="Авторизация"
              sx={{ color: 'white' }}
              onClick={() => setIsAuthModalOpen(true)} // Показываем модалку
            >
              <AccountCircleIcon /> {/* Иконка профиля */}
            </IconButton>
          )}

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

      <HomeDrawer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} accessToken={accessToken} setAccessToken={setAccessToken} />

      <Dialog open={isAuthModalOpen} fullScreen={false} onClose={() => setIsAuthModalOpen(false)}>
        <DialogTitle>
          <Button onClick={() => setIsAuthModalOpen(false)} startIcon={<CloseIcon />}>
            Закрыть
          </Button>
        </DialogTitle>

        <DialogContent dividers>
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
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;
