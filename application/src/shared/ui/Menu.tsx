import { NavLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyOffIcon from '@mui/icons-material/KeyOff';

import '../../App.css';
import { type ActiveRole, useAuth } from '../../providers/AuthProvider.tsx';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';

type MenuItemConfig = {
  label: string;
  to: string;
  icon: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary';
};

interface MenuProps {
  setIsMenuOpen?: (isMenuOpen: boolean) => void;
}

function Menu({ setIsMenuOpen }: MenuProps) {
  const { user, passport, logout, activeRole, switchRole } = useAuth();

  const MENU: { user: MenuItemConfig[]; teacher: MenuItemConfig[]; place: MenuItemConfig[] } = {
    user: [
      {
        label: 'Создать идею',
        to: '/chat?target=idea',
        icon: <AutoAwesomeIcon />,
        variant: 'primary',
      },
      {
        label: 'Мои идеи',
        to: `/user/${user?.id}/ideas`,
        icon: <LightbulbIcon />,
      },
      {
        label: 'Мои проекты',
        to: `/user/${user?.id}/projects`,
        icon: <AssignmentIcon />,
      },
      {
        label: 'Мои встречи',
        to: `/user/${user?.id}/meets`,
        icon: <CalendarMonthIcon />,
      },
    ],
    teacher: [
      {
        label: 'Дашборд',
        to: '/teacher',
        icon: <AssignmentIcon />,
      },
      {
        label: 'ИИ проект',
        to: '/chat?target=project',
        icon: <CreateNewFolderIcon />,
        variant: 'primary',
      },
      {
        label: 'Новый проект',
        to: '/teacher/projects/create',
        icon: <CreateNewFolderIcon />,
      },
      {
        label: 'Мои проекты',
        to: '/teacher/projects',
        icon: <FolderIcon />,
      },
      {
        label: 'Встречи',
        to: '/teacher/meets',
        icon: <CalendarMonthIcon />,
      },
      {
        label: 'Идеи учеников',
        to: '/teacher/ideas',
        icon: <LightbulbIcon />,
      },
    ],
    place: [
      {
        label: 'Дашборд',
        to: '/place',
        icon: <AssignmentIcon />,
      },
      {
        label: 'Учителя',
        to: '/place/teachers',
        icon: <AddIcon />,
      },
      {
        label: 'Проекты',
        to: '/place/projects',
        icon: <FolderIcon />,
      },
      {
        label: 'Расписание',
        to: '/place/meets',
        icon: <CalendarMonthIcon />,
      },
    ],
  };

  const menuItems = activeRole !== 'guest' ? MENU[activeRole] : [];

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
          {activeRole === 'user' && <Avatar src={user?.image || undefined} alt={user?.title || 'Пользователь'} sx={{ width: 56, height: 56 }} />}
          {activeRole === 'teacher' && <Avatar src={user?.image || undefined} alt={passport?.title || 'Учитель'} sx={{ width: 56, height: 56 }} />}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeRole === 'user' && 'Ученик'}
              {activeRole === 'teacher' && 'Учитель'}
              {activeRole === 'place' && 'Центр'}
            </Typography>

            {activeRole === 'user' && (
              <>
                <Typography sx={{ fontWeight: 800 }}>{user?.title || 'Пользователь'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user?.age ? `${user.age} лет` : 'Возраст не указан'}
                </Typography>
              </>
            )}

            {activeRole === 'teacher' && <Typography sx={{ fontWeight: 800 }}>{passport?.title || 'Учитель'}</Typography>}
          </Box>
        </Stack>
        <FormControl size="small" fullWidth>
          <Select
            value={activeRole}
            onChange={e => {
              const value = e.target.value as ActiveRole;
              switchRole(value);
              //setIsMenuOpen?.(false);
            }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            <MenuItem value="user">Ученик</MenuItem>
            <MenuItem value="teacher">Учитель</MenuItem>
            <MenuItem value="place">Центр</MenuItem>
          </Select>
        </FormControl>
        <List disablePadding>
          {menuItems.map(item => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              disabled={item.disabled}
              onClick={() => {
                //setIsMenuOpen?.(false);
              }}
              sx={{
                mb: item.variant === 'primary' ? 1 : 0,
                borderRadius: 2,

                ...(item.variant === 'primary'
                  ? {
                      bgcolor: 'secondary.main',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#3B1992',
                      },
                    }
                  : {
                      '&.active': {
                        bgcolor: 'action.selected',
                      },
                    }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: item.variant === 'primary' ? 'inherit' : undefined,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Stack>

      <Box sx={{ p: 3, mt: 'auto', backgroundColor: 'gray', filter: 'invert(1)' }}>
        <List disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
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
