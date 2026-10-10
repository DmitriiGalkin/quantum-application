import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../../requests.ts';

export interface ProjectFormValues {
  title: string;
  description: string;
  image: string;
  placeId: number;
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
  return (
    <Stack spacing={3}>
      <TextField select label="Центр" value={values.placeId || ''} required fullWidth onChange={e => onChange({ ...values, placeId: Number(e.target.value) })}>
        {places.map(place => <MenuItem key={place.id} value={place.id}>{place.title || place.address}</MenuItem>)}
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
