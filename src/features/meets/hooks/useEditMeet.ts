import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpdateMeet } from '../../../requests.ts';
import type { MeetFormValues } from '../MeetForm.tsx';
import type { MeetDto } from 'entities';
import { invalidateMeetQueries } from './queries.ts';

export function useEditMeet(meet: MeetDto, onClose: () => void) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MeetFormValues>({
    projectId: meet.projectId,
    date: new Date(meet.startedAt).toISOString().slice(0, 10), // YYYY-MM-DD
    time: new Date(meet.startedAt).toTimeString().slice(0, 5), // HH:mm
    duration: meet.duration || 0,
    price: meet.price || 0,
  });

  const updateMeet = useMutation({
    mutationFn: (form: MeetFormValues) => {
      const { date, time, ...data } = form;
      return fetchUpdateMeet(meet.id, { ...data, startedAt: `${date}T${time}:00` });
    },

    onSuccess: async () => {
      await invalidateMeetQueries(queryClient, meet.projectId);
      onClose();
      // refetch?.();
    },
  });

  return {
    form,
    setForm,
    onSubmit: () => updateMeet.mutate(form),
    loading: updateMeet.isPending,
  };
}
