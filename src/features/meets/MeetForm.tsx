import { Button, MenuItem, Stack, TextField } from '@mui/material';

import MeetDateField from './MeetDateField.tsx';
import MeetTimeField from './MeetTimeField.tsx';
import type { PlaceScheduleDayDto } from 'types';

export interface MeetFormValues {
  projectId: number;

  date: string;
  time: string;

  duration: number;
  price: number;
}

interface Props {
  schedule: PlaceScheduleDayDto[];
  values: MeetFormValues;

  loading?: boolean;
  submitLabel?: string;

  onChange: (values: MeetFormValues) => void;
  onSubmit: () => void;
}

export default function MeetForm({ schedule, values, loading = false, submitLabel = 'Сохранить', onChange, onSubmit }: Props) {
  return (
    <Stack spacing={2}>
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
        {[30, 45, 60, 90, 120].map(duration => (
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

      <Button variant="contained" disabled={loading} onClick={onSubmit}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
