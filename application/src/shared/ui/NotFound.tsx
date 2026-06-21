import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" sx={{ fontWeight: 900 }} color="error">
        404
      </Typography>
      <Typography color="text.secondary">Страница не найдена.</Typography>
    </Container>
  );
}

export default NotFound;