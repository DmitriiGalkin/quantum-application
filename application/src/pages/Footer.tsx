import { Box, Container, Grid, Typography, Link } from '@mui/material';

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
              Modern platform for managing ideas and projects.
            </Typography>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Product
            </Typography>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              Features
            </Link>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              Pricing
            </Link>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              Docs
            </Link>
          </Grid>

          {/* Column 3 */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Company
            </Typography>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              About
            </Link>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              Blog
            </Link>
            <Link href="#" underline="hover" sx={{ display: 'block' }}>
              Careers
            </Link>
          </Grid>

          {/* Column 4 */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              support@quantum.app
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
