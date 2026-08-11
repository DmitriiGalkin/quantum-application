import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import '../../App.css';
import { useAuth } from '../../providers/AuthProvider.tsx';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import Toolbar from '@mui/material/Toolbar';
import { Divider, Stack, Typography } from '@mui/material';

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

function Menu({ setIsMenuOpen }: any) {
  const { activeContext } = useAuth();

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
            icon: <AssignmentIcon />,
          },
        ],
      },
    ],
    user: [
      // {
      //   items: [
      //     {
      //       label: 'Создать идею',
      //       to: '/chat?target=idea',
      //       icon: <AutoAwesomeIcon />,
      //       variant: 'primary',
      //     },
      //   ],
      // },
      {
        items: [
          {
            label: 'Главная',
            to: `/user`,
          },
          {
            label: 'Мои идеи',
            to: `/user/ideas`,
            icon: <LightbulbIcon />,
          },
          {
            label: 'Мои проекты',
            to: `/user/projects`,
            icon: <AssignmentIcon />,
          },
          {
            label: 'Мои встречи',
            to: `/user/meets`,
            icon: <CalendarMonthIcon />,
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
            icon: <AssignmentIcon />,
          },
          {
            label: 'Встречи',
            to: '/teacher/meets',
            icon: <CalendarMonthIcon />,
          },
          {
            label: 'Проекты',
            to: '/teacher/projects',
            icon: <FolderIcon />,
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
            icon: <AssignmentIcon />,
          },
          {
            label: 'Расписание',
            to: `/place/meets`,
            icon: <CalendarMonthIcon />,
          },
          {
            label: 'Проекты',
            to: `/place/projects`,
            icon: <FolderIcon />,
          },
          {
            label: 'Ученики',
            to: `/place/users`,
            icon: <FolderIcon />,
          },
        ],
      },
      {
        title: 'Масштабирование',
        items: [
          {
            label: 'Учителя',
            to: `/place/teachers`,
            icon: <AddIcon />,
          },
          {
            label: 'Помещения',
            to: `/place/locations`,
            icon: <AddIcon />,
          },
        ],
      },
      {
        title: 'Финансы',
        items: [
          {
            label: 'Поступления',
            to: `/place/billing`,
            icon: <AssignmentIcon />,
          },
          {
            label: 'Статистика',
            to: `/place/stats`,
            icon: <FolderIcon />,
          },
        ],
      },
    ],
  };

  const menuSections = MENU[activeContext.role];

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
      {/*<Divider />*/}
      {/*<List>*/}
      {/*  <ListItemButton>*/}
      {/*    <ListItemIcon*/}
      {/*      sx={{*/}
      {/*        minWidth: 40,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <HelpIcon />*/}
      {/*    </ListItemIcon>*/}

      {/*    <ListItemText primary="Помощь" />*/}
      {/*  </ListItemButton>*/}

      {/*  <ListItemButton>*/}
      {/*    <ListItemText primary="Обратная связь" />*/}
      {/*  </ListItemButton>*/}
      {/*</List>*/}
    </Stack>
  );
}

export default Menu;
