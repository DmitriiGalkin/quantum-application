import Box from '@mui/material/Box';
import '../App.css';
import Header from '../components/Header.tsx';
import Stack from '@mui/material/Stack';
import Footer from './Footer.tsx';
import Menu from '../components/Menu.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert } from "@mui/material";

interface Props {
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
}
function Page({ children, isLoading, isError }: Props) {
  return (
    <Box
      sx={{
        height: '100vh', // ⬅️ важно: не minHeight
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // ⬅️ запрещаем общий скролл
      }}
    >
      <Header />

      {isError && <Alert severity="error">Не удалось загрузить.</Alert>}

      <Box sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <Stack direction="row" sx={{ height: '100%' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: { md: 280 },
              flexShrink: 0,
              display: { xs: 'none', md: 'block' },
              height: '100%', // ⬅️ ключевое
            }}
          >
            <Menu />
          </Box>

          {/* Content */}

          {isLoading ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                pt: 2,
                px: 2,
                height: '100%',
                overflow: 'auto', // ⬅️ СКРОЛЛ ТОЛЬКО ЗДЕСЬ
              }}
            >
              {children}
              <Footer />
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default Page;
