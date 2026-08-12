import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import '../../App.css';
import { useAuth } from '../../providers/AuthProvider.tsx';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Toolbar from '@mui/material/Toolbar';
import { Divider, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DomainIcon from '@mui/icons-material/Domain';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import BarChartIcon from '@mui/icons-material/BarChart';

type MenuItemConfig = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary';
};

type MenuSection = {
  title?: string;
  items: MenuItemConfig[];
};

function Menu({ setIsMenuOpen }: { setIsMenuOpen: (isOpen: boolean) => void }) {
  const { role } = useAuth();

  const MENU: {
    guest: MenuSection[];
    user: MenuSection[];
    teacher: MenuSection[];
    place: MenuSection[];
  } = {
    guest: [
      {
        items: [
          {
            label: 'Идеи',
            to: `/`,
            icon: <LightbulbIcon />,
          },
          {
            label: 'Проекты',
            to: `/projects`,
            icon: <WorkIcon />,
          },
        ],
      },
    ],
    user: [
      {
        items: [
          {
            label: 'Главная',
            to: `/user`,
            icon: <DashboardIcon />,
          },
          {
            label: 'Мои встречи',
            to: `/user/meets`,
            icon: <CalendarMonthIcon />,
          },
          {
            label: 'Мои проекты',
            to: `/user/projects`,
            icon: <WorkIcon />,
          },
          {
            label: 'Мои идеи',
            to: `/user/ideas`,
            icon: <LightbulbIcon />,
          },
        ],
      },
    ],
    teacher: [
      {
        items: [
          {
            label: 'Дашборд',
            to: '/teacher',
            icon: <DashboardIcon />,
          },
          {
            label: 'Встречи',
            to: '/teacher/meets',
            icon: <CalendarMonthIcon />,
          },
          {
            label: 'Проекты',
            to: '/teacher/projects',
            icon: <WorkIcon />,
          },
        ],
      },
      {
        items: [
          {
            label: 'Мои идеи',
            to: `/teacher/ideas`,
            icon: <LightbulbIcon />,
          },
          {
            label: 'Идеи учеников',
            to: '/teacher/userIdeas',
            icon: <LightbulbIcon />,
          },
        ],
      },
    ],
    place: [
      {
        items: [
          {
            label: 'Дашборд',
            to: `/place`,
            icon: <DashboardIcon />,
          },
          {
            label: 'Расписание',
            to: `/place/meets`,
            icon: <CalendarMonthIcon />,
          },
          {
            label: 'Проекты',
            to: `/place/projects`,
            icon: <WorkIcon />,
          },
          {
            label: 'Ученики',
            to: `/place/users`,
            icon: <PersonIcon />,
          },
        ],
      },
      {
        title: 'Масштабирование',
        items: [
          {
            label: 'Учителя',
            to: `/place/teachers`,
            icon: <SchoolIcon />,
          },
          {
            label: 'Помещения',
            to: `/place/locations`,
            icon: <DomainIcon />,
          },
        ],
      },
      {
        title: 'Финансы',
        items: [
          {
            label: 'Поступления',
            to: `/place/billing`,
            icon: <PaymentsIcon />,
          },
          {
            label: 'Статистика',
            to: `/place/stats`,
            icon: <BarChartIcon />,
          },
        ],
      },
    ],
  };

  const menuSections = MENU[role];

  return (
    <Stack sx={{ width: 250, height: '100%' }}>
      <Toolbar>
        <Typography variant="h6">Quantum</Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {sectionIndex > 0 && (
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="textDisabled">
                  {section.title}
                </Typography>
              </Divider>
            )}

            {section.items.map(item => (
              <ListItemButton
                key={item.label}
                component={item.disabled ? 'div' : NavLink}
                to={item.disabled ? undefined : item.to}
                end={!item.disabled}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    setIsMenuOpen?.(false);
                  }
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
          </Box>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </Stack>
  );
}

export default Menu;
