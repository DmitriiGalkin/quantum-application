import { Button, Stack, TextField } from '@mui/material';

export interface MeetFormValues {
  projectId: number;
  startedAt: string;
  duration: number;
  price: number;
}

interface MeetFormProps {
  values: MeetFormValues;
  loading?: boolean;
  submitLabel?: string;

  onChange: (values: MeetFormValues) => void;
  onSubmit: () => void;
}

export default function MeetForm({ values, loading = false, submitLabel = 'Сохранить', onChange, onSubmit }: MeetFormProps) {
  return (
    <Stack spacing={3}>
      <TextField
        type="datetime-local"
        label="Дата и время"
        value={values.startedAt}
        onChange={e =>
          onChange({
            ...values,
            startedAt: e.target.value,
          })
        }
        fullWidth
      />

      <TextField
        type="number"
        label="Продолжительность (мин.)"
        value={values.duration}
        onChange={e =>
          onChange({
            ...values,
            duration: Number(e.target.value),
          })
        }
        fullWidth
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
        fullWidth
      />

      <Button variant="contained" disabled={loading} onClick={onSubmit}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
