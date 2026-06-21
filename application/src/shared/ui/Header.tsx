import { useState } from 'react';
import Typography from '@mui/material/Typography';
import '../../App.css';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Drawer from './Drawer.tsx';
import { Link, useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from '../../providers/AuthProvider.tsx';

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

function Header() {
  const navigate = useNavigate();
  const { passport, authHandler } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {!passport && (
            <IconButton onClick={authHandler} color="primary" aria-label="Авторизация" sx={{ color: 'white' }}>
              <KeyIcon />
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
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
          {passport && (
            <IconButton aria-label="open drawer" sx={{ color: 'white' }} onClick={() => setIsMenuOpen(currentValue => !currentValue)}>
              <AccountCircleIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </>
  );
}

export default Header;
