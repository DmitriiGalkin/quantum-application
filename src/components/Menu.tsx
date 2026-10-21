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
import { colors, sidebarWidth } from '../theme/design-tokens';

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
          {
            label: 'Проекты',
            to: '/teacher/projects',
            icon: <WorkIcon />,
          },
          {
            label: 'Мой профиль',
            to: '/teacher/profile',
            icon: <PersonIcon />,
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
            disabled: true,
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
    ...(role === 'teacher' ? [{ title: 'Вдохновение', items: [
      { label: 'Библиотека идей', to: '/ideas', icon: <LightbulbIcon /> },
      { label: 'Идеи учеников', to: '/teacher/userIdeas', icon: <LightbulbIcon /> },
    ] }] : []),
  ];

  if (!passport) return null;
  return (
    <Stack component="nav" aria-label="Мой кабинет" sx={{ width: compact ? 72 : sidebarWidth, minHeight: '100%', p: compact ? 0 : 1.5 }}>
      <List>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {section.title && !compact && (
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
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
                end={item.disabled ? undefined : true}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    setIsMenuOpen?.(false);
                  }
                }}
                sx={{
                  justifyContent: compact ? 'center' : undefined,
                  minHeight: 48,
                  borderRadius: '12px',
                  mb: 0.5,

                  ...(item.variant === 'primary'
                    ? {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }
                    : {
                        '&.active': {
                          bgcolor: 'action.selected',
                          color: colors.onSelected,
                          boxShadow: `inset 4px 0 ${colors.primary}`,
                          '& .MuiListItemIcon-root': { color: 'inherit' },
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

                {!compact && <ListItemText primary={item.label} secondary={item.disabled ? 'Недоступно' : undefined} slotProps={{ primary: { sx: { fontSize: 14 } } }} />}
              </ListItemButton>
              </Tooltip>
            ))}
          </Box>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {!compact && <Typography variant="body2" sx={{ m: 1, p: 2, borderRadius: '16px 16px 16px 5px', bgcolor: colors.peach, color: colors.onPeach }}>
        Учиться через увлечение. Создавать своими руками.
      </Typography>}
    </Stack>
  );
}

export default Menu;
