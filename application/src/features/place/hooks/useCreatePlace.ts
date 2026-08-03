import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchCreatePlace } from '../../../requests.ts';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PLACE_SCHEDULE } from '../../../pages/place/PlaceDashboardPage.tsx';
import type { PlaceFormValues } from '../PlaceForm.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';

export function useCreatePlace() {
  const navigate = useNavigate();
  const {switchPlace} = useAuth()
  const [form, setForm] = useState<PlaceFormValues>({
    title: '',
    description: '',
    image: '',
    address: '',
    latitude: 55.76127510250765,
    longitude: 37.64222000000001,
    schedule: DEFAULT_PLACE_SCHEDULE
  });

  const createPlace = useMutation({
    mutationFn: fetchCreatePlace,

    onSuccess: placeId => {
      switchPlace(placeId);
      navigate(`/place`);
    },
  });

  return {
    form,
    setForm,
    onSubmit: () => createPlace.mutate(form),
    loading: createPlace.isPending,
  };
}