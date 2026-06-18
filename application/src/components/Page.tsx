import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert } from '@mui/material';
import Footer from './Footer';
import Header from './Header.tsx';

interface Props {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  withoutLeft?: boolean;
}

function Page({ children, isLoading, isError }: Props) {
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

      {isError && <Alert severity="error">Не удалось загрузить.</Alert>}

      {/* CONTENT */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
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
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 2,
              }}
            >
              {children}
            </Box>
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Page;
