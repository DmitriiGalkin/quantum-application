import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import MeetForm from './MeetForm.tsx';
import { useEditMeet } from './hooks/useEditMeet.ts';
import type { MeetDto, PlaceScheduleDayDto } from 'entities';
import { useQuery } from '@tanstack/react-query';
import { fetchLocationsByPlace, fetchPlace } from '../../requests.ts';

export function EditMeetDialog({ meet, open, onClose, schedule }: { meet: MeetDto; open: boolean; onClose: () => void; schedule?: PlaceScheduleDayDto[] }) {
  const { form, setForm, onSubmit, loading, error } = useEditMeet(meet, onClose);
  const place = useQuery({ queryKey: ['place', meet.place.id], queryFn: () => fetchPlace(meet.place.id), enabled: open && !schedule });
  const locations = useQuery({ queryKey: ['locations', meet.place.id], queryFn: () => fetchLocationsByPlace(meet.place.id), enabled: open });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ClosableDialogTitle onClose={onClose}>Редактирование встречи</ClosableDialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <MeetForm values={form} onChange={setForm} schedule={schedule ?? place.data?.schedule ?? []} onSubmit={onSubmit} loading={loading}
          locations={locations.data} locationsLoading={locations.isPending || locations.isError || (!schedule && (place.isPending || place.isError))}
          error={error || locations.error?.message || place.error?.message} minParticipants={meet.participantCount ?? meet.users?.length ?? 0}
          limitRequired={meet.maxParticipants !== null} submitLabel="Сохранить" />
      </DialogContent>
    </Dialog>
  );
}
