import { Alert, Button, Stack, TextField } from '@mui/material';
import { PlaceScheduleField } from './PlaceScheduleField.tsx';
import type { PlaceScheduleDayDto } from 'types';

export interface LocationFormValues {
  title: string;
  schedule: PlaceScheduleDayDto[];
}

interface PlaceFormProps {
  values: LocationFormValues;
  loading?: boolean;
  error?: boolean;
  submitLabel?: string;

  onChange: (values: LocationFormValues) => void;
  onSubmit: () => void;
}

export default function LocationForm({ values, loading = false, error = false, submitLabel = 'Сохранить', onChange, onSubmit }: PlaceFormProps) {
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

      <PlaceScheduleField
        value={values.schedule}
        onChange={schedule =>
          onChange({
            ...values,
            schedule,
          })
        }
      />
      {error && <Alert severity="error">Не удалось сохранить локацию</Alert>}
      <Button
        variant="contained"
        size="large"
        onClick={onSubmit}
        disabled={loading || !values.title.trim()}
      >
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
