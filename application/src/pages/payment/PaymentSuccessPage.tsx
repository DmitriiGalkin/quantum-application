import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPayment } from '../../requests.ts';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  // // https://q3-dev.ru/payment/success?OutSum=300.00&InvId=15&SignatureValue=6ad3d89a6375bec869cebfbaf519c3ce&IsTest=1&Culture=ru
  const [searchParams] = useSearchParams();
  // const outSum = Number(searchParams.get('OutSum'));
  const paymentId = Number(searchParams.get('InvId'));
  //const SignatureValue = Number(searchParams.get('SignatureValue'));

  const { data: payment } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => fetchPayment(paymentId),
    enabled: Boolean(paymentId),
  });

  console.log(payment);

  useEffect(() => {
    if(payment) {
      if (payment.targetType === 'meet' && payment.meet) {
        window.location.href = `/project/${payment.meet.projectId}#meet-${payment.meet.id}`;
      }
    }
  }, [payment]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Спасибо!</Typography>

      <Typography sx={{ mt: 2 }}>Оплата успешно выполнена!</Typography>
    </Container>
  );
}
