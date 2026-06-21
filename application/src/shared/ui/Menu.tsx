import { Link, NavLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import '../../App.css';
import { useAuth } from '../../providers/AuthProvider.tsx';


interface MenuProps {
  setIsMenuOpen?: (isMenuOpen: boolean) => void;
}

function Menu({ setIsMenuOpen }: MenuProps) {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          <Avatar src={user?.image || undefined} alt={user?.title || 'Пользователь'} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography sx={{ fontWeight: 800 }}>{user?.title || 'Пользователь'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.age ? `${user.age} лет` : 'Возраст не указан'}
            </Typography>
          </Box>
        </Stack>

        <List disablePadding>
          <ListItemButton
            component={Link}
            to="/chat?target=idea"
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
            component={NavLink}
            to={`/user/${user?.id}/ideas`}
            onClick={() => {
              setIsMenuOpen?.(false);
            }}
            sx={{
              borderRadius: 2,
              '&.active': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LightbulbIcon />
            </ListItemIcon>
            <ListItemText primary="Мои идеи" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to={`/user/${user?.id}/projects`}
            onClick={() => {
              setIsMenuOpen?.(false);
            }}
            sx={{
              borderRadius: 2,
              '&.active': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Мои проекты" />
          </ListItemButton>

          <ListItemButton component={Link} to="/" onClick={() => setIsMenuOpen?.(false)} sx={{ borderRadius: 2 }} disabled>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Календарь" />
          </ListItemButton>
        </List>
      </Stack>

      <Box sx={{ p: 3, mt: 'auto', backgroundColor: 'gray', filter: 'invert(1)' }}>
        <List disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              '&.active': {
                bgcolor: 'action.selected',
              },
            }}
            component={NavLink}
            to="/chat?target=project"
            onClick={() => setIsMenuOpen?.(false)}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <CreateNewFolderIcon />
            </ListItemIcon>
            <ListItemText primary="Новый проект" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/passport/projects"
            onClick={() => setIsMenuOpen?.(false)}
            sx={{
              borderRadius: 2,
              '&.active': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Мои проекты" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/chat?target=user"
            onClick={() => {
              localStorage.removeItem('active_chat_id');
            }}
            disabled
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Добавить ребенка" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/"
            onClick={() => {
              logout();
              //localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
              setIsMenuOpen?.(false);
            }}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <KeyOffIcon />
            </ListItemIcon>
            <ListItemText primary="Выйти" />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

export default Menu;
