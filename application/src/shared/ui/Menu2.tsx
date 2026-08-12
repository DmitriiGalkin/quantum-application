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
import { ListItemAvatar, Tab, Tabs } from '@mui/material';
import { type SyntheticEvent, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import type { ActiveRole } from '@shared/types';
import { useNavigate } from 'react-router-dom';

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

function Menu2({ setIsMenuOpen }: MenuProps) {
  const navigate = useNavigate();
  const { users, places, passport, logout, activeContext, switchUser, switchTeacher, switchPlace } = useAuth();
  const [value, setValue] = useState(activeContext.role);

  const handleChange = (_: SyntheticEvent, newValue: ActiveRole) => {
    setValue(newValue);
  };

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
        {!!users.length && (
          <Tab
            value="user"
            label="Ученик"
            {...a11yProps('user')}
            onClick={() => {
              switchUser((activeContext?.userId) ?? users[0].id);
              navigate(`/user`);
            }}
          />
        )}
        {true && (
          <Tab
            value="teacher"
            label="Учитель"
            {...a11yProps('teacher')}
            onClick={() => {
              switchTeacher();
              navigate(`/teacher`);
            }}
          />
        )}
        {!!places.length && (
          <Tab
            value="place"
            label="Центр"
            {...a11yProps('place')}
            onClick={() => {
              switchPlace(activeContext?.placeId ?? places[0].id);
              navigate(`/place`);
            }}
          />
        )}
      </Tabs>

      {activeContext.role === 'user' && (
        <>
          {Boolean(users.length) && (
            <List disablePadding>
              {users.map(user => (
                <ListItemButton selected={activeContext?.userId === user.id} onClick={() => switchUser(user.id)}>
                  <ListItemAvatar>
                    <Avatar src={user?.image || undefined} alt={user?.title || 'Пользователь'} sx={{ width: 40, height: 40 }} />
                  </ListItemAvatar>
                  <ListItemText primary={user?.title || 'Пользователь'} secondary={user?.age ? `${user.age} лет` : 'Возраст не указан'} />
                  {activeContext?.userId === user.id && <CheckIcon />}
                </ListItemButton>
              ))}
            </List>
          )}
        </>
      )}

      {activeContext.role === 'place' && (
        <>
          {Boolean(places.length) && (
            <Stack spacing={3} sx={{ p: 2 }}>
              {places.map(place => (
                <Stack
                  key={place.id}
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                  }}
                  onClick={() => switchPlace(place.id)}
                >
                  <Avatar alt={place?.title || 'Учитель'} sx={{ width: 56, height: 56 }} variant="rounded">
                    {place?.title?.[0] || 'Q'}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {'Центр'}
                    </Typography>

                    <Typography sx={{ fontWeight: 800 }}>{place?.title || 'Центр'}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {place?.address ? place.address : 'Возраст не указан'}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </>
      )}

      {activeContext.role === 'teacher' && (
        <Stack spacing={3} sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <Avatar src={passport?.image || undefined} alt={passport?.title || 'Учитель'} sx={{ width: 56, height: 56 }} />

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Учитель
              </Typography>

              <Typography sx={{ fontWeight: 800 }}>{passport?.title || 'Учитель'}</Typography>
            </Box>
          </Stack>
        </Stack>
      )}

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

export default Menu2;