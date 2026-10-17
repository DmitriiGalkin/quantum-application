import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import MeetForm from './MeetForm.tsx';
import { useEditMeet } from './hooks/useEditMeet.ts';
import type { MeetDto, PlaceScheduleDayDto } from 'entities';
import { useQuery } from '@tanstack/react-query';
import { fetchLocationsByPlace, fetchPlace, fetchPlaces } from '../../requests.ts';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../providers/auth-context.ts';

export function EditMeetDialog({ meet, open, onClose, schedule }: { meet: MeetDto; open: boolean; onClose: () => void; schedule?: PlaceScheduleDayDto[] }) {
  const { form, setForm, onSubmit, loading, error } = useEditMeet(meet, onClose);
  const { role,passport } = useAuth();
  const placeId = form.placeId ?? meet.place.id;
  const canRelocate = role === 'teacher' && passport?.id === meet.passport.id;
  const places = useQuery({ queryKey:['places'],queryFn:fetchPlaces,enabled:open && canRelocate });
  const place = useQuery({ queryKey: ['place', placeId], queryFn: () => fetchPlace(placeId), enabled: open });
  const locations = useQuery({ queryKey: ['locations', placeId], queryFn: () => fetchLocationsByPlace(placeId), enabled: open });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ClosableDialogTitle onClose={onClose}>Редактирование встречи</ClosableDialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {canRelocate && <TextField select fullWidth label="Центр проведения" value={placeId} disabled={places.isPending || loading} sx={{ my: 2 }} onChange={e => setForm({ ...form,placeId:Number(e.target.value),locationId:null })}>
          {!places.data?.some(p => p.id === placeId) && <MenuItem value={placeId}>{meet.place.title}</MenuItem>}
          {places.data?.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
        </TextField>}
        {placeId !== meet.place.id && <>
          <Alert severity="info" sx={{ mb:2 }}>Прежняя бронь будет снята. Новому центру поступит заявка; записи учеников сохранятся, семьи получат уведомления.</Alert>
          <TextField fullWidth required label="Причина переноса" value={form.reason ?? ''} onChange={e => setForm({ ...form,reason:e.target.value })} sx={{ mb:2 }} />
        </>}
        <MeetForm values={form} onChange={setForm} schedule={placeId === meet.place.id && schedule ? schedule : place.data?.schedule ?? []} onSubmit={onSubmit} loading={loading}
          locations={locations.data} locationsLoading={locations.isPending || locations.isError || (!schedule && (place.isPending || place.isError))}
          error={error || locations.error?.message || place.error?.message} minParticipants={meet.participantCount ?? meet.users?.length ?? 0}
          limitRequired={meet.maxParticipants !== null} submitLabel="Сохранить" />
      </DialogContent>
    </Dialog>
  );
}
