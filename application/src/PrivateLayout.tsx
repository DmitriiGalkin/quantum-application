import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './shared/ui/Header.tsx';
import { Footer } from './shared/ui/Footer2.tsx';
import { useAuth } from './providers/AuthProvider.tsx';
import type { ActiveRole } from '@shared/types';

export function PrivateLayout({ privateRole }: { privateRole: ActiveRole }) {
  const { role, switchPlace, passport } = useAuth();

  if (privateRole !== role && role !== 'guest') {
    if (privateRole === 'place') {
      switchPlace(passport?.places[0]?.id ?? 0);
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
