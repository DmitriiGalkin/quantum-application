import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces, fetchLocationsByPlace } from '../../../requests.ts';
import { formatMoney } from '../../../utils/time.ts';
import type { ProjectKind, ProjectWeeklySlot } from 'entities';
import { weekdays } from './weekly-schedule.ts';

export interface ProjectFormValues {
  kind: ProjectKind;
  weeklySchedule: ProjectWeeklySlot[];
  title: string;
  description: string;
  image: string;
  placeId: number;
  locationId?: number | null;
}

interface ProjectFormProps {
  values: ProjectFormValues;
  loading?: boolean;
  error?: boolean;
  submitLabel?: string;

  onChange: (values: ProjectFormValues) => void;
  onSubmit: () => void;
}

export default function ProjectForm({ values, loading = false, error = false, submitLabel = 'Сохранить', onChange, onSubmit }: ProjectFormProps) {
  const { data: places = [] } = useQuery({ queryKey: ['places'], queryFn: fetchPlaces });
  const { data: locations = [], isPending: locationsPending, isError: locationsError } = useQuery({
    queryKey: ['public-place-locations', values.placeId],
    queryFn: () => fetchLocationsByPlace(values.placeId),
    enabled: Boolean(values.placeId),
  });
  const updateSlot = (index: number, slot: ProjectWeeklySlot) => onChange({
    ...values, weeklySchedule: values.weeklySchedule.map((current, position) => position === index ? slot : current),
  });
  const scheduleValid = values.kind !== 'regular' || Boolean(values.weeklySchedule.length
    && values.weeklySchedule.every(slot => slot.weekday >= 1 && slot.weekday <= 7
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.startTime) && slot.duration > 0 && slot.duration <= 1440));
  return (
    <Stack spacing={3}>
      <TextField select label="Формат" value={values.kind} fullWidth onChange={event => {
        const kind = event.target.value as ProjectKind;
        onChange({ ...values, kind, weeklySchedule: kind === 'project' ? [] : values.weeklySchedule });
      }}>
        <MenuItem value="project">Проект</MenuItem>
        <MenuItem value="regular">Кружок / секция</MenuItem>
      </TextField>
      {values.kind === 'regular' && <Stack spacing={1.5}>
        <Typography variant="subtitle2">Еженедельное расписание · МСК</Typography>
        <Typography variant="body2" color="text.secondary">
          Расписание показывает обычное время занятий. Для записи преподаватель отдельно создаёт и согласует встречи.
        </Typography>
        {values.weeklySchedule.map((slot, index) => <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField select label="День" value={slot.weekday} sx={{ minWidth: 110 }}
            onChange={event => updateSlot(index, { ...slot, weekday: Number(event.target.value) })}>
            {weekdays.map((day, dayIndex) => <MenuItem key={day} value={dayIndex + 1}>{day}</MenuItem>)}
          </TextField>
          <TextField label="Начало" type="time" value={slot.startTime} sx={{ minWidth: 130 }}
            onChange={event => updateSlot(index, { ...slot, startTime: event.target.value })} />
          <TextField label="Длительность, мин" type="number" value={slot.duration} slotProps={{ htmlInput: { min: 1, max: 1440 } }}
            onChange={event => updateSlot(index, { ...slot, duration: Number(event.target.value) })} />
          <Button onClick={() => onChange({ ...values, weeklySchedule: values.weeklySchedule.filter((_, position) => position !== index) })}>Удалить</Button>
        </Stack>)}
        <Button onClick={() => onChange({ ...values, weeklySchedule: [...values.weeklySchedule, { weekday: 1, startTime: '15:00', duration: 60 }] })}>
          Добавить день и время
        </Button>
      </Stack>}
      <TextField select label="Центр" value={values.placeId || ''} required fullWidth onChange={e => onChange({ ...values, placeId: Number(e.target.value), locationId: null })}>
        {places.map(place => <MenuItem key={place.id} value={place.id}>{place.title || place.address}</MenuItem>)}
      </TextField>
      <TextField select label="Зал" value={values.locationId ?? ''} fullWidth
        disabled={!values.placeId || locationsPending || locationsError}
        error={locationsError}
        helperText={locationsError ? 'Не удалось загрузить залы' : undefined}
        onChange={e => onChange({ ...values, locationId: e.target.value === '' ? null : Number(e.target.value) })}>
        <MenuItem value="">Не выбран</MenuItem>
        {values.locationId && !locations.some(location => location.id === values.locationId) && <MenuItem value={values.locationId} disabled>Зал недоступен</MenuItem>}
        {locations.map(location => <MenuItem key={location.id} value={location.id}>{location.title} · {location.hourlyRate === null ? 'ставка не указана' : `${formatMoney(location.hourlyRate)} / час`}</MenuItem>)}
      </TextField>
      <TextField
        label="Название"
        value={values.title}
        onChange={e =>
          onChange({
            ...values,
            title: e.target.value,
          })
        }
        required
        fullWidth
      />

      <TextField
        label="Описание"
        value={values.description}
        onChange={e =>
          onChange({
            ...values,
            description: e.target.value,
          })
        }
        multiline
        minRows={6}
        required
        fullWidth
      />

      <TextField
        label="URL изображения"
        value={values.image}
        onChange={e =>
          onChange({
            ...values,
            image: e.target.value,
          })
        }
        fullWidth
      />

      {error && <Alert severity="error">Не удалось сохранить проект</Alert>}

      <Button variant="contained" size="large" onClick={onSubmit} disabled={loading || !values.placeId || !values.title.trim() || !values.description.trim() || !scheduleValid}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
