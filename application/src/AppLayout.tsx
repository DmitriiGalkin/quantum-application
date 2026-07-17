import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './shared/ui/Header.tsx';
import Footer from './shared/ui/Footer.tsx';

export function AppLayout({ withoutPaddings }: { withoutPaddings?: boolean }) {
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
        sx={
          !withoutPaddings
            ? {
                px: 2,
                pt: 2,
                pb: 10,
                flex: 1,
              }
            : {
                flex: 1,
              }
        }
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}
