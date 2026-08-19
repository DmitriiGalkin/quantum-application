import { Container, Stack } from '@mui/material';
import Box from '@mui/material/Box';

export default function Hero({ children, chip }: any) {
  return (
    <Box
      sx={{
        py: 10,
        background: 'linear-gradient(135deg,#7139FF 0%, #8F7DFB 100%)',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        {chip && <Box sx={{pb:4}}>{chip}</Box>}
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          {children}
        </Stack>
      </Container>
    </Box>
  );
}