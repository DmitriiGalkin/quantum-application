import { Box, Container, Grid, Link, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1 */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quantum
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              "Найти и создать детский проект за 10 минут"
            </Typography>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 3, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Платформа
            </Typography>
            <Link href="/landing/parent" underline="hover" sx={{ display: 'block' }}>
              <Typography>Родителям</Typography>
            </Link>
            <Link href="/landing/teacher" underline="hover" sx={{ display: 'block' }}>
              <Typography>Учителям</Typography>
            </Link>
            <Link href="/landing/place" underline="hover" sx={{ display: 'block' }}>
              <Typography>Центрам</Typography>
            </Link>
          </Grid>

          {/* Column 3 */}
          <Grid size={{ xs: 3, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Компания
            </Typography>
            <Link href="/about" underline="hover" sx={{ display: 'block' }}>
              <Typography>О нас</Typography>
            </Link>
            <Link href="/mission" underline="hover" sx={{ display: 'block' }}>
              <Typography>Миссия</Typography>
            </Link>
            <Link href="/oferta.odt" underline="hover" sx={{ display: 'block' }} target="_blank">
              <Typography>Оферта</Typography>
            </Link>
          </Grid>

          {/* Column 4 */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Контакты
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              4757037@google.com
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              +7 (901) 536 37 06 по будням с 9:00 до 18:00
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ИНН: 772793546441
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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} Quantum. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" underline="hover">
              <Typography>Политика конфиденциальности</Typography>
            </Link>
            <Link href="/terms" underline="hover">
              <Typography>Условия использования</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
