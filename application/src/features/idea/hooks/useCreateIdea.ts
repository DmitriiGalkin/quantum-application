import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateIdea } from '../../../requests.ts';
import { useNavigate } from 'react-router-dom';
import type { IdeaFormValues } from '../ui/IdeaForm.tsx';

export function useCreateIdea() {
  const navigate = useNavigate();
  const [form, setForm] = useState<IdeaFormValues>({
    title: '',
    description: '',
  });

  const createIdea = useMutation({
    mutationFn: fetchCreateIdea,
    onSuccess: (ideaId) => navigate(`/idea/${ideaId}`),
  });

  return {
    form,
    setForm,
    onSubmit: () => createIdea.mutate(form),
    loading: createIdea.isPending,
  };
}