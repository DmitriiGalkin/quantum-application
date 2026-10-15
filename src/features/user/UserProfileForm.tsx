import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export interface UserProfileValues { title: string; age: number | ''; image: string }
interface Props {
  values: UserProfileValues;
  onChange: (values: UserProfileValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string;
}

export default function UserProfileForm({ values, onChange, onSubmit, onCancel, loading, error }: Props) {
  const validAge = values.age === '' || (Number.isSafeInteger(values.age) && values.age >= 0);
  return <Stack component="form" spacing={2} onSubmit={event => { event.preventDefault(); if (values.title.trim() && validAge) onSubmit(); }}>
    <TextField label="Имя ребёнка" value={values.title} required disabled={loading} slotProps={{ htmlInput: { maxLength: 255 } }} onChange={event => onChange({ ...values, title: event.target.value })} />
    <TextField label="Возраст" type="number" value={values.age} disabled={loading} error={!validAge}
      helperText={validAge ? 'Можно оставить пустым' : 'Укажите целое неотрицательное число'} slotProps={{ htmlInput: { min: 0, step: 1 } }}
      onChange={event => onChange({ ...values, age: event.target.value === '' ? '' : Number(event.target.value) })} />
    <TextField label="URL фотографии" value={values.image} disabled={loading} slotProps={{ htmlInput: { maxLength: 255 } }} onChange={event => onChange({ ...values, image: event.target.value })} />
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      <Button type="submit" variant="contained" disabled={loading || !values.title.trim() || !validAge}>{loading ? 'Сохранение…' : 'Сохранить профиль'}</Button>
      <Button disabled={loading} onClick={onCancel}>Отмена</Button>
    </Stack>
  </Stack>;
}
