import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCreateMeet } from '../../../requests.ts';
import type { MeetFormValues } from '../MeetForm.tsx';
import { invalidateMeetQueries } from './queries.ts';

export function useCreateMeet(projectId: number, refetch: ()=>void) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MeetFormValues>({
    date: '',
    time: '',
    duration: 60,
    price: 0,
    projectId: Number(projectId) || 0,
  });

  const createMeetMutation = useMutation({
    mutationFn: (form: MeetFormValues) =>
      fetchCreateMeet({
        ...form,
        startedAt: `${form.date}T${form.time}:00`,
      }),
  });

  return {
    form,
    setForm,
    onSubmit: () =>
      createMeetMutation.mutate(form, {
        onSuccess: async () => {
          await invalidateMeetQueries(queryClient, projectId);
          refetch();
        },
      }),
    loading: createMeetMutation.isPending,
  };
}
