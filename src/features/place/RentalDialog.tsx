import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { RoomDto } from 'entities';
import type { useRentalForm } from './hooks/useRentalForm.ts';
import { moscowFormat } from '../meets/moscow-time.ts';
import { formatMoney } from '../../utils/time.ts';

export function RentalDialog({ form, rooms }: { form: ReturnType<typeof useRentalForm>; rooms: RoomDto[] }) {
  const { values, setValues, busy, mutation, passport } = form;
  const field = (key: 'start' | 'end' | 'participants' | 'comment', value: string) => setValues({ ...values, [key]: value });
  return <Dialog open={form.open} onClose={() => form.setOpen(false)} fullWidth maxWidth="sm">
    <DialogTitle>Заявка на аренду</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
      <Typography>Время по Москве. Изменение времени — новая заявка после отмены прежней.</Typography>
      <TextField select label="Зал" value={values.locationId} onChange={e => setValues({ ...values, locationId: Number(e.target.value) })}>
        {rooms.filter(room => room.rentalEnabled).map(room => <MenuItem key={room.id} value={room.id}>{room.title}</MenuItem>)}
      </TextField>
      {form.room && <Typography>{form.room.hourlyRate === null ? 'Цена по согласованию' : `${formatMoney(form.room.hourlyRate)} / час. Сумма будет рассчитана при отправке.`}</Typography>}
      <TextField label="Начало (МСК)" type="datetime-local" value={values.start} onChange={e => field('start', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
      <TextField label="Окончание (МСК)" type="datetime-local" value={values.end} onChange={e => field('end', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
      <TextField label="Число участников" type="number" value={values.participants} onChange={e => field('participants', e.target.value)} slotProps={{ htmlInput: { min: 1, max: form.room?.capacity ?? undefined } }} required />
      <TextField label="Комментарий" multiline minRows={3} value={values.comment} onChange={e => field('comment', e.target.value)} slotProps={{ htmlInput: { maxLength: 5000 } }} />
      {values.start && <Stack spacing={1}><Typography variant="subtitle1">Занято в выбранный день</Typography>
        {busy.isPending && <Typography role="status">Загрузка занятости…</Typography>}
        {busy.isError && <Alert severity="error" action={<Button onClick={() => void busy.refetch()}>Повторить</Button>}>Не удалось загрузить занятость</Alert>}
        {busy.data?.length === 0 && <Typography>Занятых интервалов нет</Typography>}
        {busy.data?.map((slot, index) => <Typography key={index}>{moscowFormat(slot.startedAt, { dateStyle: 'short', timeStyle: 'short' })} — {moscowFormat(slot.endedAt, { dateStyle: 'short', timeStyle: 'short' })} (МСК)</Typography>)}
      </Stack>}
      {passport && !passport.isTeacher && <Alert severity="info">Для отправки заявки создайте хотя бы один проект.</Alert>}
      {mutation.isError && <Alert severity="error">{mutation.error.message}</Alert>}
      {mutation.isSuccess && <Alert severity="success">Заявка отправлена. Она появится в разделе «Моя аренда».</Alert>}
    </Stack></DialogContent>
    <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}><Button onClick={() => form.setOpen(false)}>Закрыть</Button>
      <Button variant="contained" disabled={mutation.isPending || mutation.isSuccess || Boolean(passport && !passport.isTeacher) || !values.start || !values.end || !values.locationId || Number(values.participants) < 1} onClick={form.submit}>
        {passport ? 'Отправить заявку' : 'Войти и продолжить'}
      </Button>
    </DialogActions>
  </Dialog>;
}
