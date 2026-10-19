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
    placeId: meet.place.id,
    reason: '',
    projectId: meet.projectId,
    ...moscowInput(meet.startedAt),
    duration: meet.duration ?? 60,
    price: meet.price || 0,
    locationId: meet.locationId,
    maxParticipants: meet.maxParticipants ?? '',
  });

  const updateMeet = useMutation({
    mutationFn: ({ form, expectedVenueHourlyRate }: { form: MeetFormValues; expectedVenueHourlyRate: number }) => {
      return fetchUpdateMeet(meet.id, { placeId: form.placeId, reason: form.reason, price: form.price, duration: form.duration, locationId: form.locationId, expectedVenueHourlyRate,
        maxParticipants: form.maxParticipants === '' ? null : form.maxParticipants, startedAt: meetStart(form.date, form.time) });
    },

    onError: async error => {
      if (error.message.includes('Ставка зала изменилась')) await queryClient.invalidateQueries({ queryKey: ['locations'] });
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
    onSubmit: (expectedVenueHourlyRate: number) => updateMeet.mutate({ form, expectedVenueHourlyRate }),
    loading: updateMeet.isPending,
    error: updateMeet.error?.message,
  };
}
