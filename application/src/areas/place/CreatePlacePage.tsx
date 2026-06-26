import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchCreatePlace } from '../../requests.ts';

export default function CreatePlacePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    address: '',
    latitude: 55.76127510250765,
    longitude: 37.64222000000001,
  });

  const createPlace = useMutation({
    mutationFn: fetchCreatePlace,

    onSuccess() {
      navigate('/place');
    },
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Создать учебный центр</Typography>

        <TextField
          label="Название"
          value={form.title}
          onChange={e =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <TextField
          label="Описание"
          multiline
          minRows={4}
          value={form.description}
          onChange={e =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <TextField
          label="Изображение"
          value={form.image}
          onChange={e =>
            setForm({
              ...form,
              image: e.target.value,
            })
          }
        />

        <TextField
          label="Адрес"
          value={form.address}
          onChange={e =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <Button variant="contained" onClick={() => createPlace.mutate(form)}>
          Создать центр
        </Button>
      </Stack>
    </Box>
  );
}
