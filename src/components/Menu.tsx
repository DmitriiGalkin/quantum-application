import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
//import '../App.css';
import { useAuth } from 'providers/auth-context.ts';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DomainIcon from '@mui/icons-material/Domain';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import BarChartIcon from '@mui/icons-material/BarChart';
import Tooltip from '@mui/material/Tooltip';

interface MenuItemConfig {
  label: string;
  to: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary';
}

interface MenuSection {
  title?: string;
  items: MenuItemConfig[];
}

function Menu({ setIsMenuOpen, compact = false }: { setIsMenuOpen?: (isOpen: boolean) => void; compact?: boolean }) {
  const { role, passport } = useAuth();

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
          { label: 'Моя аренда', to: '/teacher/rentals', icon: <DomainIcon /> },
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
          { label: 'Заявки на аренду', to: '/place/rentals', icon: <CalendarMonthIcon /> },
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

  const menuSections: MenuSection[] = [
    ...(role === 'guest' ? [] : MENU[role].map((section, index) => ({ ...section, title: index === 0 ? 'Мой кабинет' : section.title }))),
    ...(role === 'teacher' ? [{ title: 'Вдохновение', items: [{ label: 'Библиотека идей', to: '/ideas', icon: <LightbulbIcon /> }] }] : []),
  ];

  if (!passport) return null;
  return (
    <Stack component="nav" aria-label="Мой кабинет" sx={{ width: compact ? 72 : 250, height: '100%' }}>
      {!compact && <Toolbar>
        <Typography variant="h6">Quantum</Typography>
      </Toolbar>}
      <Divider />
      <List>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {section.title && !compact && (
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="textDisabled">
                  {section.title}
                </Typography>
              </Divider>
            )}

            {section.items.map(item => (
              <Tooltip key={item.label} title={compact ? item.label : ''} placement="right">
              <ListItemButton
                aria-label={item.label}
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
                  justifyContent: compact ? 'center' : undefined,
                  minHeight: 48,
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
                    minWidth: compact ? 0 : 40,
                    color: item.variant === 'primary' ? 'inherit' : undefined,
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!compact && <ListItemText primary={item.label} />}
              </ListItemButton>
              </Tooltip>
            ))}
          </Box>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </Stack>
  );
}

export default Menu;
