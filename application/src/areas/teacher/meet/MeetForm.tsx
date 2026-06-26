import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

export interface MeetFormValues {
  startedAt: string;
  duration: number;
  price: number;
}

interface MeetFormProps {
  projectId: number;
  initialValues?: MeetFormValues;
  onSubmit: (data: MeetFormValues & { projectId: number }) => void;
  loading?: boolean;
}

function toDateTimeLocal(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

export default function MeetForm({ projectId, initialValues, onSubmit, loading = false }: MeetFormProps) {
  const [form, setForm] = useState<MeetFormValues>({
    startedAt: '',
    duration: 60,
    price: 0,
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...initialValues,
        startedAt: toDateTimeLocal(initialValues.startedAt),
      });
    }
  }, [initialValues]);

  console.log('form', form);

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">{initialValues ? 'Редактирование встречи' : 'Новая встреча'}</Typography>

        <TextField
          type="datetime-local"
          label="Дата и время"
          value={form.startedAt}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              startedAt: e.target.value,
            }))
          }
          fullWidth
        />

        <TextField
          type="number"
          label="Продолжительность (мин.)"
          value={form.duration}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              duration: Number(e.target.value),
            }))
          }
          fullWidth
        />

        <TextField
          type="number"
          label="Стоимость"
          value={form.price}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              price: Number(e.target.value),
            }))
          }
          fullWidth
        />

        <Button
          variant="contained"
          disabled={loading}
          onClick={() =>
            onSubmit({
              projectId,
              ...form,
            })
          }
        >
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
      </Stack>
    </Box>
  );
}
