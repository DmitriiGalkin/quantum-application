import { useState } from 'react';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateChat } from '../requests.ts';
import { useTarget } from '../helper.ts';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import HomeDrawer from '../components/HomeDrawer.tsx';
import { useNavigate } from 'react-router-dom';

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const target = useTarget();

  const mutation = useMutation({
    mutationFn: fetchCreateChat,
  });

  return (
    <>
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

      <HomeDrawer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </>
  );
}

export default Header;
