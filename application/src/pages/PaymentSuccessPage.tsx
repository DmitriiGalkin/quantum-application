import Container from '@mui/material/Container';
import { Typography } from '@mui/material';

export default function PaymentSuccessPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Спасибо!</Typography>

      <Typography sx={{ mt: 2 }}>Оплата успешно выполнена.</Typography>
    </Container>
  );
}
