import { Alert, Button, Stack, TextField } from '@mui/material';
import { PlaceScheduleField } from './PlaceScheduleField.tsx';
import type { PlaceScheduleDayDto } from 'dto';

export interface PlaceFormValues {
  title: string;
  description: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;

  schedule: PlaceScheduleDayDto[];
}

interface PlaceFormProps {
  values: PlaceFormValues;
  loading?: boolean;
  error?: boolean;
  submitLabel?: string;

  onChange: (values: PlaceFormValues) => void;
  onSubmit: () => void;
}

export default function PlaceForm({ values, loading = false, error = false, submitLabel = 'Сохранить', onChange, onSubmit }: PlaceFormProps) {
  return (
    <Stack spacing={3}>
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
      <TextField
        label="Адрес"
        value={values.address}
        onChange={e =>
          onChange({
            ...values,
            address: e.target.value,
          })
        }
        required
        fullWidth
      />
      <PlaceScheduleField
        value={values.schedule}
        onChange={schedule =>
          onChange({
            ...values,
            schedule,
          })
        }
      />
      ;{error && <Alert severity="error">Не удалось сохранить учебный центр</Alert>}
      <Button
        variant="contained"
        size="large"
        onClick={onSubmit}
        disabled={loading || !values.title.trim() || !values.description.trim() || !values.address.trim()}
      >
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
