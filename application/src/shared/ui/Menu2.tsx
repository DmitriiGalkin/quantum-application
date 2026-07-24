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
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import type { ActiveRole } from '@shared/types';

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
  const { activeUser, users, places, passport, activePlace, activeTeacher, logout, activeContext, switchUser, switchTeacher, switchPlace } = useAuth();

  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
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
      </Stack>

      {activeContext.role === 'place' && (
        <List>
          <ListItemButton
            onClick={() => {
              setIsMenuOpen?.(false);
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
              }}
            >
              <KeyOffIcon />
            </ListItemIcon>

            <ListItemText primary="Настройки центра" />
          </ListItemButton>
        </List>
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