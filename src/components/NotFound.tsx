import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" sx={{ fontWeight: 900 }} color="error">
        404
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>Страница не найдена.</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>К проектам</Button>
    </Container>
  );
}

export default NotFound;
