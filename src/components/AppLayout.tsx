import Box from '@mui/material/Box';
import { Outlet, useLocation } from 'react-router-dom';
import Header from 'components/Header.tsx';
import { Footer } from 'components/Footer2.tsx';
import { Suspense } from 'react';
import Typography from '@mui/material/Typography';
import { useAuth } from 'providers/auth-context.ts';
import { sidebarWidth } from '../theme/design-tokens';

export function AppLayout({ withoutPaddings }: { withoutPaddings?: boolean }) {
  const { passport } = useAuth();
  const { pathname } = useLocation();
  const isWorkspace = /^\/(user|teacher|place|chats)(\/|$)/.test(pathname);
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box component="a" href="#main-content" sx={{ position: 'absolute', left: 8, top: -100, zIndex: theme => theme.zIndex.modal + 1,
        bgcolor: 'primary.main', color: 'primary.contrastText', p: 1.5, borderRadius: 2, '&:focus': { top: 8 } }}>
        К содержимому
      </Box>
      <Header />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, ml: { xs: 0, md: passport ? `${sidebarWidth}px` : 0 } }}>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={
            !withoutPaddings
              ? {
                  px: { xs: 2, md: 4 },
                  pt: { xs: 3, md: 4 },
                  pb: 6,
                  flex: 1,
                  width: '100%', maxWidth: 1320, mx: 'auto', minWidth: 0,
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

        <Footer compact={isWorkspace} />
      </Box>
    </Box>
  );
}
