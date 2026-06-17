import { Box, Container, Grid, Link, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1 */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quantum
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Современная платформа развития детских идей через проектную деятельность.
            </Typography>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Платформа
            </Typography>
            <Link href="/ideas" underline="hover" sx={{ display: 'block' }}>
              <Typography>Идеи</Typography>
            </Link>
            <Link href="/projects" underline="hover" sx={{ display: 'block' }}>
              <Typography>Проекты</Typography>
            </Link>
          </Grid>

          {/* Column 3 */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Компания
            </Typography>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              <Typography>О нас</Typography>
            </Link>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              <Typography>Миссия</Typography>
            </Link>
          </Grid>

          {/* Column 4 */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Контакты
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4757037@gmail.ru
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom line */}
        <Box
          sx={{
            mt: 5,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Quantum. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" underline="hover">
              Privacy
            </Link>
            <Link href="#" underline="hover">
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
