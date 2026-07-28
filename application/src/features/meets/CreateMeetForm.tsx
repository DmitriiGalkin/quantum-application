import { useState } from 'react';
import { Button, Card, CardContent, Stack, TextField } from '@mui/material';

export interface CreateMeet {
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  placeId: number;
}

interface Props {
  projectId: number;
  placeId: number;
  onSubmit: (data: CreateMeet) => void;
}

export function CreateMeetForm({ projectId, placeId, onSubmit }: Props) {
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');

  const handleSubmit = () => {
    if (!startedAt) return;

    onSubmit({
      projectId,
      placeId,
      startedAt,
      price: price ? Number(price) : null,
      duration: duration ? Number(duration) : null,
    });
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <TextField
            label="Дата и время"
            type="datetime-local"
            //InputLabelProps={{ shrink: true }}
            value={startedAt}
            onChange={e => setStartedAt(e.target.value)}
          />

          <TextField label="Цена (₽)" type="number" value={price} onChange={e => setPrice(e.target.value)} />

          <TextField label="Длительность (мин)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />

          <Button variant="contained" onClick={handleSubmit} disabled={!startedAt} >
            Создать встречу
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
