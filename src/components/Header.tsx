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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { colors, headerHeight, sidebarWidth } from '../theme/design-tokens';

function Header() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { passport, authHandler, logout, switchPlace, role, userId, placeId, switchUser, switchTeacher } = useAuth();
  const [isMenu2Open, setIsMenu2Open] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);
  const activeUser = passport?.users?.find(user => user.id === userId);
  const activePlace = passport?.places?.find(place => place.id === placeId);
  const roleLabel = role === 'teacher' ? 'Кабинет преподавателя'
    : role === 'place' ? `Центр · ${activePlace?.title || 'Кабинет центра'}`
      : role === 'user' ? `Кабинет семьи · ${activeUser?.title || 'Ученик'}` : 'Мой аккаунт';

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
          backgroundColor: 'background.paper',
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 3 }, gap: { xs: 0, sm: 1 }, minHeight: `${headerHeight}px !important` }}>
          {passport && <IconButton
            size="large"
            edge="start"
            aria-label="Открыть меню"
            sx={{ flexShrink: 0, display: { xs: 'inline-flex', md: 'none' } }}
            onClick={() => setIsMenu2Open(currentValue => !currentValue)}
          >
            <MenuIcon />
          </IconButton>}

          <Link to="/" style={{ textDecoration: 'none', flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'text.primary', fontSize: { xs: 18, sm: 24 }, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <Box component="span" aria-hidden="true" sx={{ display: { xs: 'none', sm: 'grid' }, placeItems: 'center', width: 34, height: 34,
                bgcolor: 'secondary.main', border: '2px solid', borderColor: 'text.primary', borderRadius: '12px 12px 6px 12px', transform: 'rotate(-6deg)', fontSize: 22 }}>q</Box>
              Quantum
            </Typography>
          </Link>
          <Button component={Link} to="/" sx={{ minWidth: 0, px: 1 }}>Проекты</Button>
          <IconButton aria-label="Сообщения" title="Сообщения"
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
                  title={roleLabel}
                  onClick={handleAccountMenuOpen}
                >
                  {getRoleIcon(role)}
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleLabel}
                </Typography>

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
              <IconButton onClick={() => authHandler()} color="primary" aria-label="Авторизация">
                <KeyIcon />
              </IconButton>
            )}
        </Toolbar>
        {passport && <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 1, overflowWrap: 'anywhere' }}>{roleLabel}</Typography>}
      </AppBar>

      {passport && <Drawer
        open={isMenu2Open && isMobile}
        onClose={() => setIsMenu2Open(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: theme => theme.zIndex.appBar + 1,
        }}
        anchor="left"
      >
        <MenuLeft setIsMenuOpen={setIsMenu2Open} />
      </Drawer>}
      {passport && <Drawer variant="permanent" anchor="left"
        sx={{ display: { xs: 'none', md: 'block' }, width: sidebarWidth,
          '& .MuiDrawer-paper': { width: sidebarWidth, top: headerHeight, height: `calc(100% - ${headerHeight}px)`, overflowX: 'hidden', bgcolor: '#FFFDF8', borderColor: colors.border } }}>
        <MenuLeft />
      </Drawer>}
    </>
  );
}

export default Header;
