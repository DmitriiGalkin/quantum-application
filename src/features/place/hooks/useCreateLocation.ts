import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCreateLocation } from '../../../requests.ts';
import { DEFAULT_PLACE_SCHEDULE } from '../default-schedule.ts';
import type { LocationFormValues } from '../LocationForm.tsx';

export function useCreateLocation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LocationFormValues>({
    title: '',
    schedule: DEFAULT_PLACE_SCHEDULE,
  });

  const createLocation = useMutation({
    mutationFn: fetchCreateLocation,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['place-locations'] }); onSuccess?.(); },
  });

  return {
    form,
    setForm,
    onSubmit: () => createLocation.mutate(form),
    loading: createLocation.isPending,
    error: createLocation.error,
  };
}
