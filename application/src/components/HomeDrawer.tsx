import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import '../App.css';
import {useQuery} from '@tanstack/react-query';
import {fetchPassport} from '../requests.ts';
import {ACCESS_TOKEN_STORAGE_KEY, saveAccessTokenFromUrl} from "../helper.ts";

const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

function HomeDrawer({ isMenuOpen, setIsMenuOpen }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const initialAccessToken = saveAccessTokenFromUrl();

  useEffect(() => {
    if (!accessToken && initialAccessToken) {
      window.requestAnimationFrame(() => {
        setAccessToken(initialAccessToken);
      });
    }
  }, [accessToken, initialAccessToken]);

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  const currentUser = passport?.users?.[0];

  return (
        <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={3} sx={{ p:3 }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={currentUser?.image || undefined}
                  alt={currentUser?.title || 'Пользователь'}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {currentUser?.title || 'Пользователь'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.age ? `${currentUser.age} лет` : 'Возраст не указан'}
                  </Typography>
                </Box>
              </Stack>

              <List disablePadding>
                <ListItemButton

                  component={Link}
                  to="/chat?target=idea"
                  onClick={() => {
                    localStorage.removeItem('active_chat_id');
                  }}
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
                  component={Link}
                  to="/ideas?variant=self"
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  sx={{ borderRadius: 2 }}
                  //selected
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои идеи" />
                </ListItemButton>

                <ListItemButton
                    component={Link}
                    to="/projects?variant=participation"
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                    sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мои проекты" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Календарь" />
                </ListItemButton>
              </List>
            </Stack>

            <Box sx={{ p:3, mt: 'auto', backgroundColor: 'gray' }}>
              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to="/project/create"
                  onClick={() => setIsMenuOpen(false)}
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
                    <CreateNewFolderIcon />
                  </ListItemIcon>
                  <ListItemText primary="Новый проект" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/projects?variant=self"
                  onClick={() => setIsMenuOpen(false)}
                  sx={{ borderRadius: 2 }}
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
                    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                    localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
                    setAccessToken(null);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <KeyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Выйти" />
                </ListItemButton>
              </List>
            </Box>
          </Box>
        </Drawer>
  );
}

export default HomeDrawer;
