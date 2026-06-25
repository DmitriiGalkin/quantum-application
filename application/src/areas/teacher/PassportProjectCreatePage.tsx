import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchCreateProject } from '../../requests.ts';
import { useNavigate } from 'react-router-dom';

interface CreateProject {
  title: string;
  description: string;
  image: string;
  ideaId?: number;
  placeId: number;
}

export default function PassportProjectCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateProject>({
    title: '',
    description: '',
    image: '',
    placeId: 1, // TODO: брать из авторизации/центра
  });

  const createProject = useMutation({
    mutationFn: fetchCreateProject,
    onSuccess: projectId => {
      navigate(`/project/${projectId}`);
    },
  });

  const handleSubmit = () => {
    createProject.mutate(form);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">
          Новый проект
        </Typography>

        <TextField
          label="Название"
          value={form.title}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              title: e.target.value,
            }))
          }
          required
          fullWidth
        />

        <TextField
          label="Описание"
          value={form.description}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              description: e.target.value,
            }))
          }
          multiline
          minRows={6}
          required
          fullWidth
        />

        <TextField
          label="URL изображения"
          value={form.image}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              image: e.target.value,
            }))
          }
          fullWidth
        />

        {createProject.isError && <Alert severity="error">Не удалось создать проект</Alert>}

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={createProject.isPending || !form.title.trim() || !form.description.trim()}
        >
          {createProject.isPending ? 'Создание...' : 'Создать проект'}
        </Button>
      </Stack>
    </Box>
  );
}
