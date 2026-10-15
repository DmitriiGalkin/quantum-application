import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import type { PaymentStatus } from 'entities';
import { fetchPayment } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import { formatMoney } from '../../utils/time.ts';

const messages: Record<PaymentStatus, { title: string; description: string }> = {
  paid: { title: 'Оплата подтверждена', description: 'Платёж получен. Сведения о встрече доступны в проекте.' },
  pending: { title: 'Ожидаем подтверждения оплаты', description: 'Подтверждение ещё не получено. Обновите статус через некоторое время.' },
  failed: { title: 'Оплата не выполнена', description: 'Вернитесь к встрече, чтобы проверить участие и повторить оплату.' },
  canceled: { title: 'Платёж отменён', description: 'Вернитесь к встрече, чтобы проверить участие и доступные действия.' },
  refunded: { title: 'Оформлен возврат оплаты', description: 'Статус возврата получен от сервера.' },
};

export default function PaymentResult({ failed = false }: { failed?: boolean }) {
  const [params] = useSearchParams();
  const paymentId = Number(params.get('InvId'));
  const validId = Number.isSafeInteger(paymentId) && paymentId > 0;
  const { passport, token, isPending: authPending, authHandler } = useAuth();
  const query = useQuery({
    queryKey: ['payment', paymentId], queryFn: () => fetchPayment(paymentId), enabled: validId && Boolean(passport),
  });
  const payment = query.data;
  const message = payment ? messages[payment.status] : undefined;
  return <Stack spacing={3} sx={{ maxWidth: 640, mx: 'auto', p: { xs: 0, sm: 3 }, overflowWrap: 'anywhere' }}>
    <Typography component="h1" variant="h4">{message?.title ?? (failed ? 'Возврат после оплаты' : 'Проверка оплаты')}</Typography>
    {!validId ? <Alert severity="info">Номер платежа не указан или некорректен. Проверьте участие в разделе встреч.</Alert>
      : !passport ? token && authPending ? <Typography role="status">Загрузка аккаунта…</Typography>
        : <><Typography>Войдите в аккаунт, с которого выполнялась оплата, чтобы узнать её статус.</Typography><Button variant="contained" onClick={() => authHandler()}>Войти и проверить оплату</Button></>
        : query.isPending ? <Typography role="status">Проверяем статус платежа…</Typography>
          : query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>Повторить</Button>}>Не удалось проверить оплату. Статус платежа пока неизвестен.</Alert>
            : payment && message ? <>
              <Typography>{message.description}</Typography>
              <Typography variant="h5">Сумма: {formatMoney(payment.amount)}</Typography>
              {payment.status === 'pending' && <Button onClick={() => void query.refetch()} disabled={query.isFetching}>Обновить статус</Button>}
              {payment.meet && <Button component={Link} variant="contained" to={`/project/${payment.meet.projectId}#meet-${payment.meet.id}`}>Вернуться к встрече</Button>}
            </> : <Alert severity="info">Сведения о платеже недоступны.</Alert>}
    <Button component={Link} to="/user/meets">Мои встречи</Button>
    <Button component={Link} to="/">Выбрать проект</Button>
  </Stack>;
}
