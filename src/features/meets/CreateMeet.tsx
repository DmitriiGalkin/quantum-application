import MeetForm from './MeetForm.tsx';
import { useCreateMeet } from './hooks/useCreateMeet.ts';
import type { PlaceScheduleDayDto } from 'dto';

export default function CreateMeet({ projectId, refetch, schedule }: { projectId: number; refetch: () => void; schedule: PlaceScheduleDayDto[] }) {
  const { form, setForm, onSubmit, loading } = useCreateMeet(projectId, refetch);

  return <MeetForm schedule={schedule} values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Создать встречу" />;
}
