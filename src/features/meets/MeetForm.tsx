import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import MeetDateField from './MeetDateField.tsx';
import MeetTimeField from './MeetTimeField.tsx';
import type { RoomDto, PlaceScheduleDayDto } from 'entities';
import { meetStart, withinPlaceHours } from '../../shared/lib/meet-time.ts';
import { venuePriceForDuration } from '../../shared/lib/venue-price.ts';
import { formatMoney } from '../../utils/time.ts';

export interface MeetFormValues {
  placeId?: number;
  reason?: string;
  projectId: number;

  date: string;
  time: string;

  duration: number;
  price: number;
  locationId: number | null;
  maxParticipants: number | '';
}

interface Props {
  schedule: PlaceScheduleDayDto[];
  values: MeetFormValues;

  loading?: boolean;
  locations?: RoomDto[];
  error?: string;
  locationsLoading?: boolean;
  minParticipants?: number;
  limitRequired?: boolean;
  submitLabel?: string;

  onChange: (values: MeetFormValues) => void;
  onSubmit: (expectedVenueHourlyRate: number) => void;
}

export default function MeetForm({ schedule, values, locations = [], error, locationsLoading, minParticipants = 1,
  limitRequired = true, loading = false, submitLabel = 'Сохранить', onChange, onSubmit }: Props) {
  const validLimit = values.maxParticipants === '' ? !limitRequired : Number.isSafeInteger(values.maxParticipants) && values.maxParticipants >= Math.max(1, minParticipants);
  const validTime = values.date && values.time && withinPlaceHours(meetStart(values.date, values.time), values.duration, schedule);
  const room = locations.find(location => location.id === values.locationId);
  const hasRate = room?.hourlyRate != null;
  return (
    <Stack spacing={2}>
      <Typography variant="body2">Дата и время встречи</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField select label="Зал" value={values.locationId ?? ''} disabled={locationsLoading}
        onChange={e => onChange({ ...values, locationId: e.target.value === '' ? null : Number(e.target.value) })}>
        <MenuItem value="">Зал не выбран</MenuItem>
        {values.locationId !== null && !locations.some(location => location.id === values.locationId) &&
          <MenuItem value={values.locationId} disabled>Зал недоступен — выберите другой</MenuItem>}
        {locations.map(location => <MenuItem key={location.id} value={location.id}>{location.title} · {location.hourlyRate === null ? 'ставка не указана' : `${formatMoney(location.hourlyRate)} / час`}</MenuItem>)}
      </TextField>
      {room && <Typography variant="body2">Аренда для преподавателя: {hasRate
        ? `${formatMoney(room.hourlyRate!)} / час · ${formatMoney(venuePriceForDuration(room.hourlyRate!, values.duration))} за встречу`
        : 'ставка не указана — заявку отправить нельзя'}</Typography>}
      <TextField type="number" label="Число мест" value={values.maxParticipants} required={limitRequired}
        error={!validLimit} helperText={values.maxParticipants === '' && !limitRequired ? 'Лимит мест не задан — укажите число мест' : `Не меньше ${Math.max(1, minParticipants)}`}
        slotProps={{ htmlInput: { min: Math.max(1, minParticipants), step: 1 } }}
        onChange={e => onChange({ ...values, maxParticipants: e.target.value === '' ? '' : Number(e.target.value) })} />
      <MeetDateField
        value={values.date}
        schedule={schedule}
        onChange={date =>
          onChange({
            ...values,
            date,
            time: '', // сбрасываем выбранное время
          })
        }
      />

      <TextField
        select
        label="Продолжительность"
        value={values.duration}
        onChange={e =>
          onChange({
            ...values,
            duration: Number(e.target.value),
          })
        }
      >
        {[...new Set([30, 45, 60, 90, 120, values.duration])].sort((a, b) => a - b).map(duration => (
          <MenuItem key={duration} value={duration}>
            {duration} мин
          </MenuItem>
        ))}
      </TextField>

      <MeetTimeField
        date={values.date}
        duration={values.duration}
        schedule={schedule}
        value={values.time}
        onChange={time =>
          onChange({
            ...values,
            time,
          })
        }
      />

      <TextField
        type="number"
        label="Стоимость"
        value={values.price}
        onChange={e =>
          onChange({
            ...values,
            price: Number(e.target.value),
          })
        }
      />

      <Button variant="contained" disabled={loading || locationsLoading || !hasRate || !validLimit || !validTime} onClick={() => {
        if (room?.hourlyRate != null) onSubmit(room.hourlyRate);
      }}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
