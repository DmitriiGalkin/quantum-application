import Container from '@mui/material/Container';
import { Typography } from '@mui/material';

export default function PaymentFailPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Оплата не выполнена</Typography>

      <Typography sx={{ mt: 2 }}>Попробуйте позже или повторите оплату.</Typography>
    </Container>
  );
}
