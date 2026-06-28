import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './shared/ui/Header.tsx';
import Page from './shared/ui/Page.tsx';

export function AppLayout() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header />
      <Page>
        <Outlet />
      </Page>
    </Box>
  );
}
