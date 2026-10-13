import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { fetchRentals, fetchRentalStatus } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';
import type { RentalStatus } from 'entities';
import { moscowFormat } from '../features/meets/moscow-time.ts';
import { formatMoney } from '../utils/time.ts';

const statuses: Record<RentalStatus, string> = { pending: 'Ожидает рассмотрения', confirmed: 'Подтверждена', rejected: 'Отклонена', cancelled: 'Отменена' };

export default function RentalsPage({ centre = false }: { centre?: boolean }) {
  const { passport, placeId, authHandler } = useAuth();
  const client = useQueryClient();
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const query = useQuery({ queryKey: ['rentals', centre, passport?.id, placeId], queryFn: () => fetchRentals(centre), enabled: Boolean(passport && (!centre || placeId)) });
  const mutation = useMutation({ mutationFn: ({ id, status, reason }: { id: number; status: RentalStatus; reason?: string }) => fetchRentalStatus(id, status, reason),
    onSuccess: async () => { setRejecting(null); setReason(''); await client.invalidateQueries({ queryKey: ['rentals'] }); await client.invalidateQueries({ queryKey: ['room-busy'] }); } });
  if (!passport) return <Button onClick={() => authHandler()}>Войти для просмотра заявок</Button>;
  if (centre && !placeId) return <Typography>Выберите кабинет центра.</Typography>;
  return <Stack spacing={2}>
    <Typography component="h1" variant="h4">{centre ? 'Заявки на аренду' : 'Моя аренда'}</Typography>
    {!centre && <Typography>Для изменения времени отмените прежнюю заявку и отправьте новую.</Typography>}
    {query.isPending && <Typography role="status">Загрузка заявок…</Typography>}
    {query.isError && <Alert severity="error" action={<Button onClick={() => void query.refetch()}>Повторить</Button>}>{query.error.message}</Alert>}
    {mutation.isError && <Alert severity="error">{mutation.error.message}</Alert>}
    {query.data?.length === 0 && <Typography>Заявок на аренду пока нет.</Typography>}
    {query.data?.map(rental => <Card key={rental.id}><CardContent><Stack spacing={1}>
      <Typography variant="h6"><Link to={`/places/${rental.placeId}`}>{rental.placeTitle}</Link> · {rental.locationTitle}</Typography>
      <Typography>{moscowFormat(rental.startedAt, { dateStyle: 'short', timeStyle: 'short' })} — {moscowFormat(rental.endedAt, { dateStyle: 'short', timeStyle: 'short' })} (МСК)</Typography>
      <Typography>{statuses[rental.status]} · Участников: {rental.participants}</Typography>
      {centre && <Typography>Заявитель: <Link to={`/teachers/${rental.applicant.id}`}>{rental.applicant.title}</Link></Typography>}
      {rental.comment && <Typography sx={{ whiteSpace: 'pre-line' }}>{rental.comment}</Typography>}
      <Typography>{rental.estimatedTotal === null ? 'Цена по согласованию' : `Ориентировочная сумма: ${formatMoney(rental.estimatedTotal)} (${formatMoney(rental.hourlyRate!)} / час)`}</Typography>
      {rental.rejectionReason && <Typography>Причина отклонения: {rental.rejectionReason}</Typography>}
      {centre && rental.status === 'pending' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: rental.id, status: 'confirmed' })}>Подтвердить</Button>
        <Button disabled={mutation.isPending} onClick={() => { setRejecting(rental.id); setReason(''); mutation.reset(); }}>Отклонить</Button>
      </Stack>}
      {!centre && ['pending', 'confirmed'].includes(rental.status) && <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: rental.id, status: 'cancelled' })}>Отменить до начала</Button>}
    </Stack></CardContent></Card>)}
    <Dialog open={rejecting !== null} onClose={() => setRejecting(null)} fullWidth maxWidth="sm">
      <DialogTitle>Причина отклонения</DialogTitle><DialogContent><TextField autoFocus fullWidth multiline minRows={3} value={reason} onChange={e => setReason(e.target.value)} label="Причина" sx={{ mt: 1 }} />{mutation.isError && <Alert severity="error">{mutation.error.message}</Alert>}</DialogContent>
      <DialogActions><Button onClick={() => setRejecting(null)}>Закрыть</Button><Button disabled={mutation.isPending || !reason.trim()} onClick={() => mutation.mutate({ id: rejecting!, status: 'rejected', reason })}>Отклонить</Button></DialogActions>
    </Dialog>
  </Stack>;
}
