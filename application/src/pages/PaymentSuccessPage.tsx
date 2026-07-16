import Container from '@mui/material/Container';
import { Typography } from '@mui/material';

export default function PaymentSuccessPage() {
  // // https://q3-dev.ru/payment/success?OutSum=300.00&InvId=15&SignatureValue=6ad3d89a6375bec869cebfbaf519c3ce&IsTest=1&Culture=ru

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Спасибо!</Typography>

      <Typography sx={{ mt: 2 }}>Оплата успешно выполнена.</Typography>
    </Container>
  );
}
