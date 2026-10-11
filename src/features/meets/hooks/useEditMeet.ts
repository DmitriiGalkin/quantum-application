import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpdateMeet } from '../../../requests.ts';
import type { MeetFormValues } from '../MeetForm.tsx';
import type { MeetDto } from 'entities';
import { invalidateMeetQueries } from './queries.ts';
import { meetStart, moscowInput } from '../../../shared/lib/meet-time.ts';

export function useEditMeet(meet: MeetDto, onClose: () => void) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MeetFormValues>({
    projectId: meet.projectId,
    ...moscowInput(meet.startedAt),
    duration: meet.duration ?? 60,
    price: meet.price || 0,
    locationId: meet.locationId,
    maxParticipants: meet.maxParticipants ?? '',
  });

  const updateMeet = useMutation({
    mutationFn: (form: MeetFormValues) => {
      return fetchUpdateMeet(meet.id, { price: form.price, duration: form.duration, locationId: form.locationId,
        maxParticipants: form.maxParticipants === '' ? null : form.maxParticipants, startedAt: meetStart(form.date, form.time) });
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
    error: updateMeet.error?.message,
  };
}
