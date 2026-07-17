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
import { useAuth } from '../../providers/AuthProvider.tsx';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import { ListItemAvatar, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import type { ActiveRole } from '@shared/types';

type MenuItemConfig = {
  label: string;
  to: string;
  icon: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary';
};

function a11yProps(index: ActiveRole) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    sx: {
      minHeight: 40,
      py: 0,
      px: 0,
      minWidth: 0,
    },
  };
}

interface MenuProps {
  setIsMenuOpen?: (isMenuOpen: boolean) => void;
}

function Menu({ setIsMenuOpen }: MenuProps) {
  const { activeUser, users, places, passport, activePlace, activeTeacher, logout, activeContext, switchUser, switchTeacher, switchPlace } = useAuth();
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    //switchRole(newValue === 0 ? 'user' : newValue === 1 ? 'teacher' : 'place');
    setValue(newValue);
  };

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
        to: `/user/${activeUser?.id}/ideas`,
        icon: <LightbulbIcon />,
      },
      {
        label: 'Мои проекты',
        to: `/user/${activeUser?.id}/projects`,
        icon: <AssignmentIcon />,
      },
      {
        label: 'Мои встречи',
        to: `/user/${activeUser?.id}/meets`,
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
        to: `/place/${activePlace?.id}`,
        icon: <AssignmentIcon />,
      },
      {
        label: 'Учителя',
        to: `/place/${activePlace?.id}/teachers`,
        icon: <AddIcon />,
      },
      {
        label: 'Проекты',
        to: `/place/${activePlace?.id}/projects`,
        icon: <FolderIcon />,
      },
      {
        label: 'Расписание',
        to: `/place/${activePlace?.id}/meets`,
        icon: <CalendarMonthIcon />,
      },
    ],
  };

  const menuItems = activeContext.role !== 'guest' ? MENU[activeContext.role] : [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: 250 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
        sx={{
          minHeight: 32,
        }}
      >
        {activeUser && <Tab label="Ученик" {...a11yProps('user')} onClick={() => switchUser(activeUser?.id ?? users[0].id)} />}
        {activeTeacher && <Tab label="Учитель" {...a11yProps('teacher')} onClick={switchTeacher} />}
        {activePlace && <Tab label="Центр" {...a11yProps('place')} onClick={() => switchPlace(activePlace?.id ?? places[0].id)} />}
      </Tabs>

      {activeContext.role === 'user' && (
        <>
          {Boolean(users.length) && (
            <List disablePadding>
              {users.map(user1 => (
                <ListItemButton selected={activeUser?.id === user1.id} onClick={() => switchUser(user1.id)}>
                  <ListItemAvatar>
                    <Avatar src={user1?.image || undefined} alt={user1?.title || 'Пользователь'} sx={{ width: 40, height: 40 }} />
                  </ListItemAvatar>
                  <ListItemText primary={user1?.title || 'Пользователь'} secondary={user1?.age ? `${user1.age} лет` : 'Возраст не указан'} />
                  {activeUser?.id === user1.id && <CheckIcon />}
                </ListItemButton>
              ))}
            </List>
          )}
        </>
      )}

      <Stack spacing={3} sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          {activeContext.role === 'teacher' && (
            <Avatar src={activeUser?.image || undefined} alt={passport?.title || 'Учитель'} sx={{ width: 56, height: 56 }} />
          )}
          {activeContext.role === 'place' && (
            <Avatar alt={activePlace?.title || 'Учитель'} sx={{ width: 56, height: 56 }} variant="rounded">
              {activePlace?.title?.[0] || 'Q'}
            </Avatar>
          )}

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeContext.role === 'teacher' && 'Учитель'}
              {activeContext.role === 'place' && 'Центр'}
            </Typography>

            {activeContext.role === 'teacher' && <Typography sx={{ fontWeight: 800 }}>{passport?.title || 'Учитель'}</Typography>}

            {activeContext.role === 'place' && (
              <>
                <Typography sx={{ fontWeight: 800 }}>{activePlace?.title || 'Центр'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {activePlace?.address ? activePlace.address : 'Возраст не указан'}
                </Typography>
              </>
            )}
          </Box>
        </Stack>
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

// interface ActiveContext {
//   role: 'user' | 'teacher' | 'place';
//   entityId?: number; // user.id или place.id, для teacher не нужен
// }