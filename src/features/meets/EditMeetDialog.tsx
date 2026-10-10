import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MeetForm from './MeetForm.tsx';
import { useEditMeet } from './hooks/useEditMeet.ts';
import type { MeetDto, PlaceScheduleDayDto } from 'entities';

export function EditMeetDialog({ meet, open, onClose, schedule }: { meet: MeetDto; open: boolean; onClose: () => void; schedule?: PlaceScheduleDayDto[] }) {
  const { form, setForm, onSubmit, loading } = useEditMeet(meet, onClose);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Редактирование встречи</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <MeetForm values={form} onChange={setForm} schedule={schedule ?? []} onSubmit={onSubmit} loading={loading} submitLabel="Сохранить" />
      </DialogContent>
    </Dialog>
  );
}
