import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import '../../App.css';
import { useAuth } from '../../providers/AuthProvider.tsx';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import HelpIcon from '@mui/icons-material/Help';
import Toolbar from '@mui/material/Toolbar';
import { Divider, Stack, Typography } from '@mui/material';

type MenuItemConfig = {
  label: string;
  to: string;
  icon: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary';
};

function Menu({ setIsMenuOpen }: any) {
  const { activeUser, activePlace, activeContext } = useAuth();

  const MENU: { guest: MenuItemConfig[]; user: MenuItemConfig[]; teacher: MenuItemConfig[]; place: MenuItemConfig[] } = {
    guest: [
      {
        label: 'Идеи',
        to: `/`,
        icon: <LightbulbIcon />,
      },
      {
        label: 'Проекты',
        to: `/projects`,
        icon: <AssignmentIcon />,
      },
    ],
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

  const menuItems = MENU[activeContext.role];

  return (
    <Stack sx={{ width: 250, height: '100%' }}>
      <Toolbar>
        <Typography variant="h6">Quantum</Typography>
      </Toolbar>

      <Divider />

      <List>
        {menuItems.map(item => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            disabled={item.disabled}
            onClick={() => {
              setIsMenuOpen?.(false);
            }}
            sx={{
              mb: item.variant === 'primary' ? 1 : 0,

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

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <List>
        <ListItemButton>
          <ListItemIcon
            sx={{
              minWidth: 40,
            }}
          >
            <HelpIcon />
          </ListItemIcon>

          <ListItemText primary="Помощь" />
        </ListItemButton>

        <ListItemButton>
          <ListItemText primary="Обратная связь" />
        </ListItemButton>
      </List>
    </Stack>
  );
}

export default Menu;
