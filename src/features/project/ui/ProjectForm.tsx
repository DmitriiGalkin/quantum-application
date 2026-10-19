import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces, fetchLocationsByPlace } from '../../../requests.ts';
import { formatMoney } from '../../../utils/time.ts';

export interface ProjectFormValues {
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
  return (
    <Stack spacing={3}>
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

      <Button variant="contained" size="large" onClick={onSubmit} disabled={loading || !values.placeId || !values.title.trim() || !values.description.trim()}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
