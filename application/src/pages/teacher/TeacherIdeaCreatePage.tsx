import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Stack, Typography } from '@mui/material';
import { fetchCreateIdea } from '../../requests.ts';
import { useNavigate } from 'react-router-dom';
import IdeaForm, { type IdeaFormValues } from '../../features/idea/ui/IdeaForm.tsx';

export default function TeacherIdeaCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<IdeaFormValues>({
    title: '',
    description: '',
  });

  const createIdea = useMutation({
    mutationFn: fetchCreateIdea,
    onSuccess: ideaId => navigate(`/idea/${ideaId}`),
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Новая идея</Typography>

        <IdeaForm
          values={form}
          onChange={setForm}
          onSubmit={() => createIdea.mutate(form)}
          loading={createIdea.isPending}
          submitLabel="Создать идею"
        />
      </Stack>
    </Box>
  );
}
