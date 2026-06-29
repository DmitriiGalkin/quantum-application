import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert } from '@mui/material';
import Footer from './Footer.tsx';

interface Props {
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  withoutLeft?: boolean;
  withoutPaddings?: boolean;
}

function Page({ children, isLoading, isError, withoutPaddings }: Props) {
  return (
    <>
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
              sx={!withoutPaddings ? {
                px: 2,
                pt: 2,
                pb: 10
              } : undefined}
            >
              {children}
            </Box>
            <Footer />
          </Box>
        )}
      </Box>
    </>
  );
}

export default Page;
