import MeetForm from './MeetForm.tsx';
import { useCreateMeet } from './hooks/useCreateMeet.ts';
import type { PlaceScheduleDayDto } from 'entities';
import { useQuery } from '@tanstack/react-query';
import { fetchLocationsByPlace } from '../../requests.ts';

export default function CreateMeet({ projectId, placeId, locationId = null, refetch, schedule }: { projectId: number; placeId: number; locationId?: number | null; refetch: () => void; schedule: PlaceScheduleDayDto[] }) {
  const { form, setForm, onSubmit, loading, error } = useCreateMeet(projectId, refetch, locationId);
  const locations = useQuery({ queryKey: ['locations', placeId], queryFn: () => fetchLocationsByPlace(placeId) });

  return <MeetForm schedule={schedule} locations={locations.data} locationsLoading={locations.isPending || locations.isError}
    error={error || locations.error?.message} values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Создать встречу" />;
}
