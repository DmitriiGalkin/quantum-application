import { useState } from 'react';
import Typography from '@mui/material/Typography';
import '../../App.css';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
//import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from '../../providers/AuthProvider.tsx';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import Menu from './Menu.tsx';
import Menu2 from './Menu2.tsx';

//const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

function Header() {
  //const navigate = useNavigate();
  const { passport, authHandler } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenu2Open, setIsMenu2Open] = useState(false);
  
  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'rgba(255,255,255, 0.1)', // ← вот это важно
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            sx={{ mr: 2, color: 'white' }}
            onClick={() => setIsMenu2Open(currentValue => !currentValue)}
          >
            <MenuIcon />
          </IconButton>

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

          {/*<IconButton*/}
          {/*  color="primary"*/}
          {/*  aria-label="Идеи от АИ"*/}
          {/*  sx={{ color: 'white' }}*/}
          {/*  onClick={() => {*/}
          {/*    const activeChatId = localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);*/}

          {/*    if (activeChatId) {*/}
          {/*      return navigate(`/chat/${activeChatId}`);*/}
          {/*    }*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <AutoAwesomeIcon />*/}
          {/*</IconButton>*/}
          {passport ? (
            <IconButton aria-label="open drawer" sx={{ color: 'white' }} onClick={() => setIsMenuOpen(currentValue => !currentValue)}>
              <AccountCircleIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => authHandler()} color="primary" aria-label="Авторизация" sx={{ color: 'white' }}>
              <KeyIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        open={isMenu2Open}
        onClose={() => setIsMenu2Open(false)}
        sx={{
          zIndex: theme => theme.zIndex.appBar + 1,
        }}
        anchor="left"
      >
        <Menu setIsMenuOpen={setIsMenu2Open} />
      </Drawer>

      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        sx={{
          zIndex: theme => theme.zIndex.appBar + 1,
        }}
        anchor="right"
      >
        <Menu2 setIsMenuOpen={setIsMenuOpen} />
      </Drawer>
    </>
  );
}

export default Header;
