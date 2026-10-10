import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import Header from 'components/Header.tsx';
import { Footer } from 'components/Footer2.tsx';
import { Suspense } from 'react';
import Typography from '@mui/material/Typography';

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
        <Suspense fallback={<Typography role="status">Загрузка страницы…</Typography>}>
          <Outlet />
        </Suspense>
      </Box>

      <Footer />
    </Box>
  );
}
