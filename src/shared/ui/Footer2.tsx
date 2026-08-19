import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import { FooterSection } from './FooterSection.tsx';

const sections = [
  {
    title: 'Платформа',
    links: [
      { label: 'Родителям', href: '/landing/parent' },
      { label: 'Учителям', href: '/landing/teacher' },
      { label: 'Центрам', href: '/landing/place' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '/about' },
      { label: 'Миссия', href: '/mission' },
      { label: 'Оферта', href: '/oferta.odt' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Условия использования', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 2, md: 5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0, md: 6 }}>
            {/* Brand */}
            <Box
              sx={{
                maxWidth: 260,
                mb: { xs: 1, md: 0 },
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography variant="h6">Квантум</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Образовательная платформа для создания и реализации проектов.
              </Typography>
            </Box>

            {/* Sections */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0, md: 6 }}>
              {sections.map(section => (
                <FooterSection key={section.title} title={section.title} links={section.links} />
              ))}
            </Stack>

            <Box
              sx={{
                maxWidth: 260,
                mb: { xs: 1, md: 0 },
                display: { xs: 'none', md: 'block' },
              }}
            >
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
            </Box>
          </Stack>

          <Divider sx={{ my: { xs: 1, md: 4 } }} />

          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Квантум
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
