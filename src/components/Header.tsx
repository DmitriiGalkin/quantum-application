import { useState } from 'react';
import Typography from '@mui/material/Typography';
//import '../App.css';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
//import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link, useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from 'providers/auth-context.ts';
import MenuIcon from '@mui/icons-material/Menu';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import Button from '@mui/material/Button';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import Drawer from '@mui/material/Drawer';
import MenuLeft from './Menu.tsx';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { ActiveRole } from 'entities';

function Header() {
  const navigate = useNavigate();

  const { passport, authHandler, logout, switchPlace, role, userId, placeId, switchUser, switchTeacher } = useAuth();
  const [isMenu2Open, setIsMenu2Open] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const getRoleIcon = (role: ActiveRole) =>{
    switch (role){
      case 'user':
        return <PersonIcon />;
      case 'teacher':
        return <SchoolIcon/>;
      case 'place':
        return <BusinessIcon/>;
      default:
        return <PersonIcon />;
    }
  };

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
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, gap: { xs: 0.25, sm: 1 } }}>
          <IconButton
            size="large"
            edge="start"
            aria-label="Открыть меню"
            sx={{ color: 'white', flexShrink: 0 }}
            onClick={() => setIsMenu2Open(currentValue => !currentValue)}
          >
            <MenuIcon />
          </IconButton>

          <Link to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'white', fontSize: { xs: 16, sm: 20 }, whiteSpace: 'nowrap',
              }}
            >
              Quantum
            </Typography>
          </Link>
          <Button component={Link} to="/" sx={{ color: 'white', minWidth: 0, px: 1 }}>Проекты</Button>
          <IconButton aria-label="Сообщения" title="Сообщения" sx={{ color: 'white' }}
            onClick={() => passport ? navigate('/chats') : authHandler('/chats')}>
            <ChatBubbleOutlineIcon />
          </IconButton>

            {passport ? (
              <>
                <IconButton
                  aria-label="Открыть меню профиля"
                  aria-controls={isAccountMenuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={isAccountMenuOpen ? 'true' : undefined}
                  sx={{ color: 'white' }}
                  onClick={handleAccountMenuOpen}
                >
                  {getRoleIcon(role)}
                </IconButton>

                <Menu
                  id="account-menu"
                  anchorEl={accountMenuAnchor}
                  open={isAccountMenuOpen}
                  onClose={handleAccountMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {/* Пользователь */}
                  <MenuItem disabled>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                        }}
                      >
                        {passport.title?.[0] ?? '?'}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText primary={passport.title} secondary="Аккаунт" />
                  </MenuItem>

                  <Divider />

                  {role !== 'guest' && <MenuItem onClick={() => {
                    handleAccountMenuClose();
                    navigate(`/${role}`);
                  }}>Мой кабинет</MenuItem>}

                  {/* Ребёнок */}
                  {passport.users?.map(user => (
                    <MenuItem
                      key={user.id}
                      selected={role === 'user' && userId === user.id}
                      onClick={() => {
                        switchUser(user.id);
                        handleAccountMenuClose();
                        navigate('/user');
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>

                      <ListItemText primary={user.title} secondary="Ученик" />
                    </MenuItem>
                  ))}

                  {/* Учитель */}
                  {passport && (
                    <MenuItem
                      selected={role === 'teacher'}
                      onClick={() => {
                        switchTeacher();
                        handleAccountMenuClose();
                        navigate('/teacher');
                      }}
                    >
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>

                      <ListItemText primary="Учитель" secondary="Образовательная деятельность" />
                    </MenuItem>
                  )}

                  {/* Центры */}
                  {passport.places?.map(place => (
                    <MenuItem
                      key={place.id}
                      selected={role === 'place' && placeId === place.id}
                      onClick={() => {
                        switchPlace(place.id);
                        handleAccountMenuClose();
                        navigate('/place');
                      }}
                    >
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>

                      <ListItemText primary={place.title} secondary="Центр" />
                    </MenuItem>
                  ))}

                  <Divider />

                  {/* Выход */}
                  <MenuItem
                    onClick={() => {
                      handleAccountMenuClose();
                      logout();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>

                    <ListItemText primary="Выйти" />
                  </MenuItem>
                </Menu>
              </>
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
        <MenuLeft setIsMenuOpen={setIsMenu2Open} />
      </Drawer>
    </>
  );
}

export default Header;
