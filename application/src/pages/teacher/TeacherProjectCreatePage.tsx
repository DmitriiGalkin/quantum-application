import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Stack, Typography } from '@mui/material';
import { fetchCreateProject } from '../../requests.ts';
import { useNavigate } from 'react-router-dom';
import ProjectForm, { type ProjectFormValues } from '../../features/project/ProjectForm.tsx';

export default function TeacherProjectCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProjectFormValues>({
    title: '',
    description: '',
    image: '',
    placeId: 1,
  });

  const createProject = useMutation({
    mutationFn: (data: ProjectFormValues) =>
      fetchCreateProject({
        ...data,
        placeId: 1,
      }),
    onSuccess: projectId => navigate(`/project/${projectId}`),
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Новый проект</Typography>

        <ProjectForm
          values={form}
          onChange={setForm}
          onSubmit={() => createProject.mutate(form)}
          loading={createProject.isPending}
          error={createProject.isError}
          submitLabel="Создать проект"
        />
      </Stack>
    </Box>
  );
}
