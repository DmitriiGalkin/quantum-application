import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateLocation } from '../../../requests.ts';
import { DEFAULT_PLACE_SCHEDULE } from '../../../pages/place/PlaceDashboardPage.tsx';
import type { LocationFormValues } from '../LocationForm.tsx';

export function useCreateLocation() {
  const [form, setForm] = useState<LocationFormValues>({
    title: '',
    schedule: DEFAULT_PLACE_SCHEDULE,
  });

  const createLocation = useMutation({
    mutationFn: fetchCreateLocation,
  });

  return {
    form,
    setForm,
    onSubmit: () => createLocation.mutate(form),
    loading: createLocation.isPending,
  };
}