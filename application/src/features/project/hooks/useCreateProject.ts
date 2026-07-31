import { useState } from 'react';
import type { ProjectFormValues } from '../ProjectForm.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProject } from '../../../requests.ts';
import { useNavigate } from 'react-router-dom';

export function useCreateProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProjectFormValues>({
    title: '',
    description: '',
    image: '',
    placeId: 0,
  });

  const createProject = useMutation({
    mutationFn: (data: ProjectFormValues) =>
      fetchCreateProject({
        ...data,
        placeId: 1,
      }),
    onSuccess: projectId => navigate(`/project/${projectId}`),
  });

  return {
    form,
    setForm,
    onSubmit: () => createProject.mutate(form),
    loading: createProject.isPending,
  };
}