import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCreateMeet } from '../../../requests.ts';
import type { MeetFormValues } from '../MeetForm.tsx';
import { invalidateMeetQueries } from './queries.ts';
import { meetStart } from '../../../shared/lib/meet-time.ts';

export function useCreateMeet(projectId: number, refetch: ()=>void, locationId: number | null) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MeetFormValues>({
    date: '',
    time: '',
    duration: 60,
    price: 0,
    projectId: Number(projectId) || 0,
    locationId,
    maxParticipants: '',
  });

  const createMeetMutation = useMutation({
    mutationFn: (form: MeetFormValues) =>
      fetchCreateMeet({
        projectId: form.projectId, price: form.price, duration: form.duration, locationId: form.locationId,
        maxParticipants: Number(form.maxParticipants), startedAt: meetStart(form.date, form.time),
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
    error: createMeetMutation.error?.message,
  };
}
