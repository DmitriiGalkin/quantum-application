import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './shared/ui/Header.tsx';
import { Footer } from './shared/ui/Footer2.tsx';
import { useAuth } from './providers/AuthProvider.tsx';
import type { ActiveRole } from '@shared/types';

export function PrivateLayout({ role }: { role: ActiveRole }) {
  const { activeContext, switchPlace, places } = useAuth();
  //console.log(activeContext?.role, 'ROLE');
  //console.log(activeContext.placeId, 'placeId');

  if (role !== activeContext?.role && activeContext?.role !== 'guest') {
    if (role === 'place') {
      //console.log('switch place');
      switchPlace(places[0]?.id ?? 0);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          px: 2,
          pt: 2,
          pb: 10,
          flex: 1,
        }}
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}
