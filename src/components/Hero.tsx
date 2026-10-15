import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { colors } from '../theme/design-tokens';

export default function Hero({ children, chip }: { children: ReactNode; chip?: ReactNode }) {
  return (
    <Box
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: colors.selected,
        color: 'text.primary',
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
